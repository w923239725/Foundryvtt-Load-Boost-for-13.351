# AI instructions: server extension

[简体中文](AGENTS.zh-CN.md)

- Follow root constraints. The generic preload/C9 injection revision has not been integration-retested;
  historical47 C5 tests are not acceptance of this package.
- Disabled by default. Do not populate production paths/credentials and activate without authorization.
  Keep private deployment.json out of Git.
- Example code/config locations are `/opt/fvtt-load-boost` and `/etc/fvtt-load-boost/deployment.json`;
  users supply actual app/data paths.
- This is Node`--require`, not a client module. Do not invent module.json or install it in Data/modules.
- Preserve executable/dataPath/port/version/hash guards. Do not remove checks to force compatibility.
- Load one entrypoint only, C9 before C5. Never stack it with old private preloads.
- C9 does not disable all package management; C5 is not a world/auth/fog cache. Do not broaden scope.
- Preserve mutation events, legacy conflicts and cloned result isolation.64MiB is not a hard RAM cap.
- Merge launchers surgically; do not overwrite other applications, create duplicate instances or reset world startup settings.
- Deployment requires independent isolated testing and maintenance approval; rollback removes the preload and restarts the target.
  Never delete databases or referenced files while active.
- Propagate native database failures rather than return empty or stale success-shaped values.
