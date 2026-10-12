"use strict";
const { AsyncLocalStorage } = require("node:async_hooks");
const { safeReporter } = require("./c5-login-read-cache.cjs");

// 新分享入口使用显式依赖，不包含原部署的目录或日志路径。
// Explicit dependencies replace private deployment paths and file logging.
function installLoginUpdatePolicy({ Socket, onEvent = () => {} }) {
  const context = new AsyncLocalStorage();
  const installed = new WeakMap();
  const report = safeReporter(onEvent);
  let sequence = 0;

  function replace(object, method, disabled) {
    if (!object || typeof object[method] !== "function") {
      throw new Error(`Unsupported Foundry API: ${method}`);
    }
    const methods = installed.get(object) || new Set();
    if (methods.has(method)) return;
    const original = object[method];
    object[method] = function (...args) {
      const state = context.getStore();
      if (!state) return original.apply(this, args);
      report({ kind: "login-check-suppressed", sequence: state.sequence, method });
      return Promise.resolve(disabled());
    };
    methods.add(method);
    installed.set(object, methods);
  }

  const on = Socket.prototype.on;
  Socket.prototype.on = function (event, listener) {
    if (event !== "world") return on.call(this, event, listener);
    return on.call(this, event, function (...args) {
      replace(global.config?.updater, "checkCoreUpdateAvailability", () => ({
        hasUpdate: false, canUpdate: false, couldReachWebsite: false,
        slowResponse: false, version: null, channel: null, willDisableModules: false,
        updateCheckDisabled: true, updateCheckStatus: "disabled-by-local-freeze-policy",
      }));
      replace(global.game?.world?.system, "getUpdateNotification", () => ({
        hasUpdate: false, version: null,
        updateCheckDisabled: true, updateCheckStatus: "disabled-by-local-freeze-policy",
      }));
      return context.run({ sequence: ++sequence }, () => listener.apply(this, args));
    });
  };
  report({ kind: "c9-installed", scope: "world login only", manualPackageManagementChanged: false });
}
module.exports = { installLoginUpdatePolicy };
