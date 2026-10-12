# Static sharing-package privacy and consistency review

[简体中文](PRIVACY-REVIEW.zh-CN.md)

## Scope and conclusion

Scope is this sharing directory and its four subprojects, not the original servers or experiment directories.
Review covered inventory, known deployment identifiers, key/credential patterns, domains/IPs/machine paths,
JSON, documentation links and distributed digests.
**No known original deployment IP, hostname, account, world name, private key, access token or session identifier was found remaining.**
This is bounded static review, not an absolute secret-free guarantee, security certification or configuration acceptance.

## Replacements and intentional content

| Category | Handling |
|---|---|
| Original hosts/addresses | `vtt.example.com`, `127.0.0.1`, documentation-only`192.0.2.10` |
| Personal paths/instances | Generic Ubuntu paths such as`/opt/foundry`and`/srv/foundry-data`; no personal home/actual PM2 name |
| Configuration/certificates | Example fields and paths only; no private complete options, certificate/key contents, PM2 dumps or Azure exports |
| World/experiment data | Anonymized counts/timings only; no actor names, document IDs, chats, raw browser traces or databases |
| Babele attribution | Public author/source/license links and modification notices are retained; not deployment identity |
| Technical identifiers | Software versions, hashes, variable names, socket.io paths and public PF1 discussion links are retained |
| Future runtime data | Real deployment.json, logs, credentials and backups remain private; gitignore does not prevent forced additions or manual uploads |

GitLab, Foundry and Creative Commons URLs identify public sources/licenses.
`1.13.5.1`is a lib-wrapper version, not a host IP. Code token/contextToken variables are not embedded access credentials.
Example PEM paths are not actual key/certificate files. No Windows deployment variant is included.

## Static consistency

- Every subproject has Chinese/English human and AI documentation with directory entry links.
- JSON examples are strict JSON, not commented Foundry settings.
- Both C5 libraries match the final historical bytes; generic entrypoint/C9 packaging is explicitly not integration-retested.
- Removing added Babele attribution comments recovers the historical candidate text; the manifest separates original,
  headerless candidate and current distribution digests.
- 01/02 are alternatives; `.link`is not loadable configuration; the cloud JSON is not an importable resource definition.
- Missing initial world-ready evidence remains unavailable; overlapping timings and unrelated experiments are not added.

No service startup, server connection, preload execution, Nginx command, benchmark or deployment occurred in this sharing revision.
No Git repository/remote, commit, push, Gist or Release was created.
On 2026-10-12 the owner selected MIT for independent code/configuration; documentation and Babele-derived code retain CC BY 4.0.
Full terms, bilingual scope, adjacent source notices and the current Foundry license link are now included;
see [LICENSE.md](../LICENSE.md). This license revision does not change runtime source bytes.
Public upstream author/acknowledgment identifiers are retained attribution, not private deployment data.

## Future additions

After customization, placeholders may become real identifiers. Review the complete folder and Git history before each publication,
especially private configuration, logs, certificates, cloud IDs, backups and accidentally included archives.
This report does not cover future additions.
