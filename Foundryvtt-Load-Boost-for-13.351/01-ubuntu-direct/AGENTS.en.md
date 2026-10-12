# AI instructions: direct Ubuntu proxy

[简体中文](AGENTS.zh-CN.md)

Read the root AI constraints first. This is a static example for Ubuntu22.04/Nginx1.18/Foundry13.351, not a validated installation.
Only perform the requested phase; reading this document authorizes no deployment, firewall change, reload or publication.

- Keep `map`/`upstream` in http context and `location` in the correct server block.
- The sites-enabled `.link` is a link specification only. Create a real Ubuntu link only when explicitly authorized.
- Merge Foundry's four example fields; never overwrite the complete options file.
- Keep upstream HTTP/1.1, conditional Upgrade/Connection and unbuffered socket.io handling.
- Core scripts/CSS receive complete representations; other Range requests use identity upstream.
- Preserve Foundry cache headers; do not introduce shared-cache policies or trust arbitrary forwarded client IPs.
- Verify topology before adapting to additional proxies, shared directories or multiple instances.
- Preserve existing TLS/ACME/auth/security configuration absent from this minimal example.
- Do not loosen home-directory permissions, use chmod777, modify sudoers or record credentials.
- Where the user requests static review only, do not execute Nginx or browser tests.
- Backups belong in private, non-served, non-included directories. Never publish logs, certificates or private options.
- Keep bilingual documentation aligned; distinguish historical observations from template validation.
