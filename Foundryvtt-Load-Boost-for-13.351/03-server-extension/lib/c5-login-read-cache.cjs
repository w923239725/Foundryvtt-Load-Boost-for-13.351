"use strict";
const assert = require("node:assert/strict");

const LEGACY_WRITE_EVENTS = ["batch", "put", "del"];

function safeReporter(onEvent) {
  let warned = false;
  return event => {
    try { onEvent(event); }
    catch (error) {
      if (warned) return;
      warned = true;
      process.emitWarning(`C5 telemetry failed; further reporter failures suppressed: ${error?.message ?? error}`,
        { code: "FVTT_C5_TELEMETRY" });
    }
  };
}

class LoginPackReadCache {
  constructor({ maxEntries = 512, maxSerializedBytes = 64 * 1024 * 1024, onEvent = () => {} } = {}) {
    assert(Number.isInteger(maxEntries) && maxEntries > 0);
    assert(Number.isFinite(maxSerializedBytes) && maxSerializedBytes > 0);
    this.maxEntries = maxEntries;
    this.maxSerializedBytes = maxSerializedBytes;
    this.onEvent = safeReporter(onEvent);
    this.entries = new Map();
    this.databases = new Map();
    this.identities = new WeakMap();
    this.nextIdentity = 1;
    this.bytes = 0;
    this.epoch = 0;
    this.world = null;
  }

  identity(value) {
    assert(value && ["object", "function"].includes(typeof value), "An identity object is required");
    if (!this.identities.has(value)) this.identities.set(value, this.nextIdentity++);
    return this.identities.get(value);
  }

  remove(key) {
    const entry = this.entries.get(key);
    if (!entry) return;
    this.entries.delete(key);
    this.bytes -= entry.bytes;
    entry.database.keys.delete(key);
    if (!entry.database.keys.size) this.release(entry.database.database);
  }

  release(database) {
    const record = this.databases.get(database);
    if (!record) return;
    this.databases.delete(database);
    record.revision++;
    for (const [event, listener] of record.listeners) database.removeListener(event, listener);
    for (const key of [...record.keys]) this.remove(key);
  }

  retainDatabases(databases) {
    for (const database of this.databases.keys()) {
      if (!databases.has(database)) this.release(database);
    }
  }

  clear(reason = "explicit") {
    this.epoch++;
    for (const key of [...this.entries.keys()]) this.remove(key);
    this.onEvent({ type: "clear", reason });
  }

  watch(database) {
    if (this.databases.has(database)) return this.databases.get(database);
    assert.equal(typeof database.on, "function", "Database events are required");
    assert.equal(typeof database.removeListener, "function", "Database listener cleanup is required");
    const modernWrites = database.supports?.events?.write === true;
    const record = { database, revision: 0, keys: new Set(), listeners: [], disabled: false };
    const invalidate = reason => {
      record.revision++;
      for (const key of [...record.keys]) this.remove(key);
      this.onEvent({ type: "invalidate", reason });
    };
    // Writes select modern/legacy events before awaiting I/O. Observe both so a
    // write already in flight when we attach cannot escape invalidation.
    // Bypass if external legacy consumers exist: adding write suppresses them.
    this.databases.set(database, record);
    try {
      if (modernWrites) {
        record.disabled = LEGACY_WRITE_EVENTS.some(event => database.listenerCount(event) > 0);
        const legacyAdded = (event, listener) => {
          if (!LEGACY_WRITE_EVENTS.includes(event) ||
              record.listeners.some(([name, owned]) => name === event && owned === listener)) return;
          record.disabled = true;
          invalidate("legacy-listener-added");
          for (const [name, listener] of record.listeners) {
            if (name === "write") database.removeListener(name, listener);
          }
        };
        record.listeners.push(["newListener", legacyAdded]);
        database.on("newListener", legacyAdded);
      }
      const writeEvents = modernWrites ?
        record.disabled ? [] : [...LEGACY_WRITE_EVENTS, "write"] : LEGACY_WRITE_EVENTS;
      for (const event of [...writeEvents, "clear", "closing"]) {
        const listener = () => invalidate(event);
        record.listeners.push([event, listener]);
        database.on(event, listener);
      }
      const closed = () => {
        invalidate("closed");
        this.release(database);
      };
      record.listeners.push(["closed", closed]);
      database.on("closed", closed);
    } catch (error) {
      this.release(database);
      throw error;
    }
    return record;
  }

  invalidate(database, reason = "metadata") {
    const record = this.databases.get(database);
    if (!record) return;
    record.revision++;
    for (const key of [...record.keys]) this.remove(key);
    this.onEvent({ type: "invalidate", reason });
  }

  trim() {
    while (this.entries.size > this.maxEntries || this.bytes > this.maxSerializedBytes) {
      this.remove(this.entries.keys().next().value);
      this.onEvent({ type: "evict" });
    }
  }

  async read(request, load) {
    assert.equal(typeof load, "function");
    if (request.eligible !== true) return load();
    const { world, pack, database, kind, contextToken, fields = [] } = request;
    assert(kind === "index" || kind === "folders", "Only pack indexes or folders can be cached");
    assert.equal(typeof contextToken, "string");
    assert(contextToken.length > 0, "A reviewed metadata/access context token is required");
    assert(Array.isArray(fields) && fields.every(field => typeof field === "string"), "Invalid index fields");
    this.identity(world);
    this.identity(pack);
    this.identity(database);
    if (database.status !== "open") {
      this.invalidate(database, "not-open");
      this.onEvent({ type: "bypass", reason: "database-not-open" });
      return load();
    }
    if (this.world !== world) {
      this.clear("world-change");
      this.world = world;
    }
    let watched;
    try { watched = this.watch(database); }
    catch (error) {
      this.onEvent({ type: "bypass", reason: "watch-failed", message: error.message });
      return load();
    }
    if (watched.disabled) {
      this.release(database);
      this.onEvent({ type: "bypass", reason: "legacy-listener-conflict" });
      return load();
    }
    const key = JSON.stringify([
      this.identity(world), this.identity(pack), this.identity(database),
      contextToken, kind, [...new Set(fields)].sort(),
    ]);
    let entry = this.entries.get(key);
    let owner = false;
    if (entry) {
      this.entries.delete(key);
      this.entries.set(key, entry);
      this.onEvent({ type: entry.pending ? "join-pending" : "hit", kind });
    } else {
      owner = true;
      const epoch = this.epoch;
      const revision = watched.revision;
      entry = { pending: true, bytes: 0, database: watched, promise: null };
      this.entries.set(key, entry);
      watched.keys.add(key);
      this.onEvent({ type: "miss", kind });
      entry.promise = Promise.resolve().then(load).then(value => {
        let snapshot, bytes;
        try {
          assert(Array.isArray(value), "Pack cache expects an array result");
          snapshot = structuredClone(value);
          bytes = Buffer.byteLength(JSON.stringify(snapshot));
        } catch (error) {
          if (this.entries.get(key) === entry) this.remove(key);
          this.onEvent({ type: "bypass", reason: "cache-preparation-failed", message: error.message });
          return { cached: false, value };
        }
        const stillValid = this.entries.get(key) === entry && this.epoch === epoch &&
          watched.revision === revision && database.status === "open";
        if (stillValid && bytes <= this.maxSerializedBytes) {
          entry.pending = false;
          entry.bytes = bytes;
          this.bytes += bytes;
          this.trim();
        } else if (this.entries.get(key) === entry) {
          this.remove(key);
          this.onEvent({ type: "not-stored", reason: stillValid ? "oversized" : "invalidated-during-read" });
        }
        return { cached: true, snapshot };
      }, error => {
        if (this.entries.get(key) === entry) this.remove(key);
        this.onEvent({ type: "load-failed", message: error.message });
        throw error;
      });
      this.trim();
    }
    const result = await entry.promise;
    if (!result.cached) return owner ? result.value : load();
    try { return structuredClone(result.snapshot); }
    catch (error) {
      if (this.entries.get(key) === entry) this.remove(key);
      this.onEvent({ type: "bypass", reason: "cache-copy-failed", message: error.message });
      return load();
    }
  }

  dispose() {
    this.clear("dispose");
    for (const database of this.databases.keys()) this.release(database);
    this.world = null;
  }
}

module.exports = { LoginPackReadCache, safeReporter };
