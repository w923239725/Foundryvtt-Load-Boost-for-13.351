"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

// 默认不加载策略；必须显式提供本机私有配置文件。
// Disabled unless an explicit private deployment file enables the policies.
const configFile = process.env.FVTT_LOAD_BOOST_CONFIG;
function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}
function argument(name) {
  const args = process.argv.slice(2);
  requireCondition(!args.includes(name), `Use ${name}=... rather than a separate value`);
  const values = args.filter(a => a.startsWith(`${name}=`));
  requireCondition(values.length === 1, `Use exactly one ${name}=... argument`);
  return values[0].slice(name.length + 1);
}
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function validate(config) {
  requireCondition(config.enabled === true, "enabled must be true");
  requireCondition(typeof config.disableLoginUpdateChecks === "boolean", "Invalid C9 switch");
  requireCondition(["off", "shadow", "on"].includes(config.compendiumCacheMode), "Invalid C5 mode");
  requireCondition(process.version === "v20.18.0", "Unreviewed Node version");
  requireCondition(!process.env.NODE_OPTIONS, "Unexpected NODE_OPTIONS");
  requireCondition(Number.isInteger(config.port) && config.port > 0 && config.port <= 65535, "Invalid port");
  requireCondition(typeof config.applicationPath === "string" && path.isAbsolute(config.applicationPath), "Absolute applicationPath required");
  requireCondition(typeof config.dataPath === "string" && path.isAbsolute(config.dataPath), "Absolute dataPath required");
  const app = fs.realpathSync(config.applicationPath);
  const data = fs.realpathSync(config.dataPath);
  // PM2在重写argv[1]之前执行preload；显式脚本身份仍必须核对。
  // PM2 loads preloads before rewriting argv[1].
  const script = process.env.pm_exec_path || process.argv[1];
  requireCondition(script && fs.realpathSync(script) === path.join(app, "main.js"), "Wrong Foundry executable");
  requireCondition(fs.realpathSync(argument("--dataPath")) === data, "Wrong dataPath");
  requireCondition(argument("--port") === String(config.port), "Wrong port");
  const versions = [
    [path.join(app, "package.json"), "13.351.0"],
    [path.join(app, "node_modules/socket.io/package.json"), "4.8.1"],
    [path.join(app, "node_modules/abstract-level/package.json"), "2.0.2"],
    [path.join(app, "node_modules/classic-level/package.json"), "2.0.0"],
    [path.join(data, "Data/systems/pf1/system.json"), "11.11"],
  ];
  for (const [file, expected] of versions) {
    requireCondition(readJson(file).version === expected, `Unreviewed version: ${path.basename(path.dirname(file))}`);
  }
  const hashes = {
    "dist/packages/world.mjs": "50c6408bc26a23a53b027d4a6366ac869b39b9a807635ce98273ca53044d7bff",
    "dist/database/backend/server-compendium.mjs": "7fd786406bdcb12cb876028436d4fc552dafeac27e1d538f3f4bb3530ff79dc2",
    "dist/database/backend/sublevel-database.mjs": "1586acbdc13ca98a0dc654a50aeb609e4de5a1066a882e044dd39e21c11dbf0c",
    "node_modules/abstract-level/abstract-level.js": "209544347e22438f9485f6c644f86946d41e38dbd735a011f3b9941c95a0ca1f",
    "node_modules/abstract-level/lib/event-monitor.js": "b44192258bf0f0e1ad47fdb754f5a86ddff158b739c75829056910d2b5064240",
  };
  for (const [relative, expected] of Object.entries(hashes)) {
    const actual = createHash("sha256").update(fs.readFileSync(path.join(app, relative))).digest("hex");
    requireCondition(actual === expected, `Unreviewed internal source: ${relative}`);
  }
  const libraries = {
    "c5-login-read-cache.cjs": "4d1c8d0dbc6b1ecc79519793626007befbc056356768afc8a3e2d567ef1e93ee",
    "c5-login-cache-adapter.cjs": "ae78ce0679da550c80717b93e03215b0ca685592e03911ece9230043d2b90445",
  };
  for (const [name, expected] of Object.entries(libraries)) {
    const actual = createHash("sha256").update(fs.readFileSync(path.join(__dirname, "lib", name))).digest("hex");
    requireCondition(actual === expected, `Modified C5 library: ${name}`);
  }
  return { app, data };
}

let prepared;
if (configFile) {
  try {
    requireCondition(path.isAbsolute(configFile), "FVTT_LOAD_BOOST_CONFIG must be absolute");
    const config = readJson(configFile);
    if (config.enabled === false) console.info("FVTT-LOAD-BOOST disabled");
    else prepared = { config, ...validate(config) };
  } catch (error) {
    // 检查发生于策略安装前，拒绝可选优化，不伪称已启用。
    // All guard checks precede installation; refusal is not successful activation.
    process.emitWarning(`Load Boost not activated: ${error.message}`, { code: "FVTT_LOAD_BOOST_GUARD" });
  }
} else {
  console.info("FVTT-LOAD-BOOST disabled: no configuration supplied");
}
if (prepared) {
  const { config, app } = prepared;
  const { Socket } = require(path.join(app, "node_modules/socket.io"));
  const { safeReporter } = require("./lib/c5-login-read-cache.cjs");
  const report = safeReporter(event => console.info(`FVTT-LOAD-BOOST ${JSON.stringify(event)}`));
  // 固定先安装C9，再安装C5。不要同时加载其他旧版策略入口。
  // Install C9 before C5; do not load a previous policy entrypoint as well.
  if (config.disableLoginUpdateChecks) {
    require("./lib/c9-login-update-policy.cjs").installLoginUpdatePolicy({ Socket, onEvent: report });
  }
  if (config.compendiumCacheMode !== "off") {
    require("./lib/c5-login-cache-adapter.cjs").installLoginPackCache({
      Socket, mode: config.compendiumCacheMode,
      getEnvironment: () => ({
        world: global.game.world, packs: global.db.packs, coreVersion: global.release.version,
        compendiumConfiguration: global.game.compendiumConfiguration,
      }),
      onEvent: report,
    });
  }
  report({ kind: "installed", c9: config.disableLoginUpdateChecks, c5Mode: config.compendiumCacheMode,
    packageStatus: "generalized-sharing-entrypoint-not-integration-retested" });
}
