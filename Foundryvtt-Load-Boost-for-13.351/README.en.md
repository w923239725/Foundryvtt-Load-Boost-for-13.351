# Foundryvtt Load Boost for 13.351

[简体中文](README.zh-CN.md)

Four shareable outputs from a Foundry VTT loading investigation. **This is not a one-click accelerator or a universally compatible release.**
Examples use `vtt.example.com`, loopback addresses and generic directories. No original deployment credentials, world data, IP addresses, domains or process dumps are included.

## Subprojects

1. [Ubuntu without a CDN](01-ubuntu-direct/README.en.md): upstream connection reuse, WebSockets and compressed-range compatibility.
2. [Ubuntu with Front Door or a similar edge service](02-ubuntu-edge/README.en.md): separate static routes, probes and conservative shared caching, with honest before/after limitations.
3. [Server extension](03-server-extension/README.en.md): C9 login update-notification suppression and C5 initial compendium index caching. Requires server access; **not a client module**.
4. [Modified Babele 2.7.5 files](04-babele-patch/README.en.md): allow non-pack reads to finish without translation startup, and coalesce initialization. Includes two attributed modified files, not a repackaged upstream module.

Each subproject has human documentation (`README.zh-CN.md`, `README.en.md`) and AI instructions
(`AGENTS.zh-CN.md`, `AGENTS.en.md`). Configuration comments are primarily Chinese; English documentation explains the same behavior.

## Versions and evidence status

Historical environment: Ubuntu 22.04, Nginx 1.18, Foundry **13.351** (package13.351.0),
Node **20.18.0**, PF1 **11.11**, Babele **2.7.5**, lib-wrapper **1.13.5.1**. No Windows deployment variant.

- Original fixed-path C5/C9 implementations were tested and applied in the originating deployment.
- The final Babele candidate passed isolated translation, full-GM, early-read and rollback checks; it was **not deployed to the originating production environment**.
- Generic entrypoints, example paths and Nginx/edge templates have been repackaged here. **Only static preparation and privacy checks were performed for this sharing revision; no server, configuration or performance validation was rerun.**
- There is no automatic installer, publishing workflow or implicit permission to change a server.

Read the [paste-ready project description](reports/PROJECT-DESCRIPTION.en.md) for issue IDs, causes, measurements,
completed work and rejected approaches. Select **either 01 or 02**: they are alternative topologies, not two site files to enable together.
Evaluate03 and04 independently.

`sites-enabled/*.link` describes a symlink; it is not executable Nginx configuration.
Merge the `options.json` example into existing settings instead of overwriting them.
Re-review upgrades, shared directories, multiple instances and existing TLS configuration.

Validate on an independent copy before approved maintenance. Do not remove content, disable game mechanics or reduce visual quality to manufacture gains.
Timing rows overlap and are not additive guarantees. No reliable complete-world-load baseline was captured for a true no-CDN deployment.

No remote repository, commit, push, Gist or Release was created.
Independent project-authored code/configuration uses **MIT**; documentation and Babele-derived code retain **CC BY 4.0**,
to the extent of the owner's licensable rights. Original Babele retains Simone's attribution and the same license;
external software is not relicensed. See [scope and redistribution](LICENSE.md), [MIT terms](LICENSE-MIT), [CC BY terms](LICENSE)
and [third-party attribution](THIRD-PARTY-NOTICES.md).
No-publication/deployment instructions govern the current agent/account workflow, not recipients' lawful redistribution under the applicable MIT or CC BY 4.0 terms.
