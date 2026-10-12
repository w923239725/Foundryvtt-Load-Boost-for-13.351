# 03: C5 / C9 server extension

[简体中文](README.zh-CN.md) · [Project](../README.md)

Authored code/configuration uses **MIT**; documentation retains **CC BY 4.0**; see [license and attribution](LICENSE.md).
Keep adjacent `.license` notices with redistributed source; they do not execute or change pinned source hashes.
Foundry and dependency implementations are not bundled or relicensed.

**Unofficial Node preload, not a Foundry client module installed in Data/modules.**
Pinned target: Foundry13.351.0, Node20.18.0, PF1 11.11, socket.io4.8.1,
abstract-level2.0.2, classic-level2.0.0. Re-review other versions; do not remove guards to force activation.

## Evidence status

The two C5 library files retain the historically tested final implementation (47 isolated tests,
real shadow comparisons and original deployment checks).
This distribution adds a generic`preload.cjs` and converts fixed-path C9 into dependency-injected code with protected console reporting.
**These packaging changes received static review only, not renewed integration or performance tests.**

## Installation layout

```text
/opt/fvtt-load-boost/
  preload.cjs
  lib/c5-login-read-cache.cjs
  lib/c5-login-cache-adapter.cjs
  lib/c9-login-update-policy.cjs
/etc/fvtt-load-boost/deployment.json  # private edited copy of the example
```

`/opt/foundry/resources/app` must contain the actual licensed Foundry main.js/package.json/node_modules.
`/srv/foundry-data` represents your existing dataPath. Do not create/move a world just to match this example.
Keep code outside public assets and private configuration readable only by the appropriate runtime account.
No npm installation is required; code uses built-ins and Foundry's bundled dependencies.
Preserve `.gitattributes`; C5 libraries are byte-hash pinned. Do not reformat or convert line endings while retaining old digests.

## Configuration and startup

1. Inspect versions/internal hashes/shared directories and existing launcher. Back it up privately. Do not double-load old C5/C9 preloads.
2. Copy `deployment.example.json` to a private file and edit applicationPath/dataPath/port.
3. Default`enabled:false` installs nothing. After independent testing explicitly enable it.
   C9 is`disableLoginUpdateChecks:true`; C5 mode is`off`, `shadow` or`on`.
   Shadow always returns fresh native results and performs extra comparison work; it is not an acceleration mode.
4. Reference command for an authorized operator, **not executed in this packaging task**:

```bash
FVTT_LOAD_BOOST_CONFIG=/etc/fvtt-load-boost/deployment.json \
node --require /opt/fvtt-load-boost/preload.cjs \
  /opt/foundry/resources/app/main.js \
  --dataPath=/srv/foundry-data --port=30000 --noupdate
```

Use exactly one `--dataPath=...` and `--port=...`, matching the private configuration.
The entry checks executable/data path/port before installing C9 then C5.
No config or disabled config means no activation. Guard failures warn with`FVTT_LOAD_BOOST_GUARD`.
Unexpected runtime errors can still affect startup/login; this is not a universal failure-isolation guarantee.

For **systemd**, add the environment variable and Node`--require` to the existing unit's startup,
preserving User, WorkingDirectory, Restart and app arguments; do not start a second instance.
For **PM2**, add the one preload to the target application's node_args and config variable to env,
preserving script/cwd/interpreter/args and other applications. Restart only the approved target and persist after acceptance.
No forceful one-line deployment command or private PM2 dump is supplied.

## Behavior and limits

- C9 suppresses only core/system update-notification queries in the initial world-request context.
  It reports disabled checks, not current versions. `--noupdate` separately prevents core upgrades;
  manual system/module package management is not globally disabled.
- C5 caches default initial pack indexes/folders, not personal world responses, chats, fog or authorization decisions.
  Original user handling/pack selection still execute; this is not exhaustive permission certification.
- Callers receive independent copies. Mutation/clear/close invalidates; old pending reads cannot repopulate.
  Modern and legacy events are observed; external legacy-consumer conflicts trigger bypass.
  Three legacy deprecation notices can occur on this dependency version.
- 512 entries and64MiB serialized budget are not a hard RAM limit; keys, objects, clones and concurrent responses add memory.
- Restart clears the cache; the first login fills it. Historical1.19–1.50s warm ready gains are not a universal guarantee.
- Never replace database files externally while open. Stop the instance for offline maintenance.
  Remove/re-review the policy before versions or internal sources change.
- Logs contain counters and lifecycle information, but runtime errors can reveal local details; keep logs private.

Future acceptance must include actual login, C9 flags, miss/hit behavior, outputs/translations and mutation invalidation.
HTTP200 or an installed log alone is insufficient.

For rollback, remove this preload/config environment from the target launcher, restore original startup arguments and restart only that instance.
Alternatively disable then restart, but do not delete still-referenced files.
The memory cache disappears on exit; no database rollback is needed. Preserve the independent pre-existing `--noupdate` decision.

No production deployer, Nginx modification or Azure dependency is included. Obtain explicit permission for maintenance and recovery actions.
