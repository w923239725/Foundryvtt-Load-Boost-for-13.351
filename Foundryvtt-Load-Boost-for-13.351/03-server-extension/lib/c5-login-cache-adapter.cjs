"use strict";
const assert = require("node:assert/strict");
const { AsyncLocalStorage } = require("node:async_hooks");
const { isDeepStrictEqual } = require("node:util");
const { performance } = require("node:perf_hooks");
const { LoginPackReadCache, safeReporter } = require("./c5-login-read-cache.cjs");

function installLoginPackCache({ Socket, getEnvironment, mode = "shadow", onEvent = () => {} }) {
  assert(["off", "shadow", "on"].includes(mode));
  onEvent = safeReporter(onEvent);
  const context = new AsyncLocalStorage();
  const installed = new Map();
  let world = null;
  let disposed = false;
  let sequence = 0;
  const cache = new LoginPackReadCache({
    onEvent(event) {
      const request = context.getStore();
      if (request) request.cacheEvents[event.type] = (request.cacheEvents[event.type] || 0) + 1;
      if (["invalidate", "load-failed", "bypass"].includes(event.type)) onEvent({ kind: "cache", ...event });
    },
  });
  const originalOn = Socket.prototype.on;

  function restorePacks(shouldRestore = () => true) {
    for (const [pack, methods] of installed) {
      if (!shouldRestore(pack)) continue;
      for (const [method, record] of methods) {
        if (pack[method] !== record.wrapped) {
          onEvent({ kind: "restore-conflict", pack: pack.collectionName, method });
          continue;
        }
        if (record.descriptor) Object.defineProperty(pack, method, record.descriptor);
        else delete pack[method];
      }
      installed.delete(pack);
    }
  }

  function requestFor(pack, method, args, request) {
    if (disposed || mode === "off" || !request) return null;
    const env = getEnvironment();
    if (env.world !== request.world ||
        env.packs.get(pack.collectionName) !== pack || !pack.connected) return null;
    const defaults = Array.from(pack.metadata.compendiumIndexFields || []);
    const fields = method === "getIndex" ? Array.from(args[0] || []) : [];
    if (method === "getIndex" &&
        !isDeepStrictEqual([...new Set(fields)].sort(), [...new Set(defaults)].sort())) return null;
    if (method === "getFolders" && args.length) return null;
    const hierarchy = Object.fromEntries(Object.entries(pack.hierarchy || {}).map(([key, value]) => [
      key, { type: value.model.documentName, fields: Array.from(value.model.metadata.compendiumIndexFields || []) },
    ]));
    const contextToken = JSON.stringify({
      coreVersion: env.coreVersion,
      systemVersion: env.world.system?.version,
      packageVersion: pack.package?.version,
      packData: pack.packData,
      ownershipAndLocks: env.compendiumConfiguration?.[pack.collectionName] ?? null,
      schemaIdentity: cache.identity(pack.schema),
      hierarchy,
      defaultFields: [...defaults].sort(),
    });
    return {
      eligible: true, world: env.world, pack, database: pack.db,
      kind: method === "getIndex" ? "index" : "folders",
      fields, contextToken,
    };
  }

  function attachPack(pack) {
    if (installed.has(pack)) return;
    const methods = new Map();
    for (const method of ["getIndex", "getFolders"]) {
      assert.equal(typeof pack[method], "function", `Missing pack ${method}`);
      const descriptor = Object.getOwnPropertyDescriptor(pack, method);
      if (descriptor && !descriptor.configurable) {
        throw new Error(`Pack method is not replaceable: ${method}`);
      }
      if (!descriptor && !Object.isExtensible(pack)) {
        throw new Error(`Pack is not extensible: ${method}`);
      }
    }
    installed.set(pack, methods);
    try {
      for (const method of ["getIndex", "getFolders"]) {
        const original = pack[method];
        const descriptor = Object.getOwnPropertyDescriptor(pack, method);
        async function wrapped(...args) {
          const request = context.getStore();
          const load = () => original.apply(this, args);
          let key;
          try { key = requestFor(this, method, args, request); }
          catch (error) {
            onEvent({ kind: "cache-context-failed", pack: this.collectionName, method, message: error.message });
            return load();
          }
          if (!key) return load();
          const candidate = await cache.read(key, load);
          if (mode === "on") return candidate;
          let fresh;
          try { fresh = await load(); }
          catch (error) {
            cache.invalidate(key.database, "shadow-fresh-read-failed");
            onEvent({ kind: "shadow-read-failed", pack: this.collectionName, method, message: error.message });
            throw error;
          }
          const equal = isDeepStrictEqual(candidate, fresh);
          request.comparisons++;
          request.rows += fresh.length;
          if (!equal) {
            request.mismatches++;
            cache.invalidate(key.database, "shadow-mismatch");
            onEvent({ kind: "shadow-mismatch", pack: this.collectionName, method });
          }
          return fresh;
        }
        Object.defineProperty(pack, method, { value: wrapped, configurable: true, writable: true });
        methods.set(method, { original, descriptor, wrapped });
      }
    } catch (error) {
      restorePacks(candidate => candidate === pack);
      throw error;
    }
  }

  function on(event, listener) {
    if (event !== "world" || mode === "off") return originalOn.call(this, event, listener);
    return originalOn.call(this, event, function (...args) {
      if (disposed) return listener.apply(this, args);
      let env;
      try {
        env = getEnvironment();
        if (env.world !== world) {
          restorePacks();
          cache.dispose();
          world = env.world;
        }
        restorePacks(pack => env.packs.get(pack.collectionName) !== pack || !pack.connected);
        cache.retainDatabases(new Set(Array.from(env.packs.values())
          .filter(pack => pack.connected).map(pack => pack.db)));
        for (const pack of env.packs.values()) {
          if (!pack.connected) continue;
          try { attachPack(pack); }
          catch (error) {
            onEvent({ kind: "pack-bypass", pack: pack.collectionName, message: error.message });
          }
        }
      } catch (error) {
        onEvent({ kind: "request-bypass", message: error.message });
        return context.run(undefined, () => listener.apply(this, args));
      }
      const request = {
        sequence: ++sequence, world: env.world, start: performance.now(),
        comparisons: 0, rows: 0, mismatches: 0, cacheEvents: {},
      };
      const index = args.findIndex(value => typeof value === "function");
      assert(index >= 0, "World request acknowledgement missing");
      const ack = args[index];
      args[index] = function (...values) {
        onEvent({
          kind: "world-summary", mode, sequence: request.sequence,
          dataReadyMs: performance.now() - request.start,
          comparisons: request.comparisons, rows: request.rows,
          mismatches: request.mismatches, cacheEvents: request.cacheEvents,
          cachedEntries: cache.entries.size, serializedBytes: cache.bytes,
        });
        return ack.apply(this, values);
      };
      return context.run(request, () => listener.apply(this, args));
    });
  }
  Socket.prototype.on = on;
  return {
    cache,
    dispose() {
      disposed = true;
      restorePacks();
      cache.dispose();
      if (Socket.prototype.on === on) Socket.prototype.on = originalOn;
      else onEvent({ kind: "socket-restore-conflict" });
    },
  };
}

module.exports = { installLoginPackCache };
