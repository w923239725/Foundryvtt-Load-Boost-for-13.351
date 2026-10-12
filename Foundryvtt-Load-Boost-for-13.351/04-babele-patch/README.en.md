# 04: Babele2.7.5 non-pack unblocking patch

[简体中文](README.zh-CN.md) · [Project](../README.md)

The independent Nginx overlay configuration uses MIT ([terms](../LICENSE-MIT)); Babele source is not relicensed as MIT.

**Unofficial modified version.** Original Babele and this project's modifications use **CC BY 4.0**,
with separate attribution to Simone and project contributors. See [subproject license](LICENSE.md).
Retain adjacent `.license` files and relevant notices on redistribution; no upstream or Foundry endorsement is implied.

This is **not a complete module release or install URL**. Obtain a legitimate Babele2.7.5 installation and lib-wrapper first.
Only two modified files are distributed here; retain upstream manifest, dependencies, translation assets and remaining sources.
Original author: **Simone Ricciardi**. See [attribution/license notices](../THIRD-PARTY-NOTICES.md).

## Versions and evidence

Historical trial: Foundry13.351, Node20.18.0, PF1 11.11, Babele2.7.5, lib-wrapper1.13.5.1.
Upstream declares minimum13/verified13.344, not compatibility with every module stack.
**Do not apply to Babele2.8,2.9 or other versions.**

The same logic passed26 local contracts, player/full-GM, pending-read,125 index/folder and22 full-document comparisons,
file install/rollback and exact-URL proxy rehearsals. It was not deployed to original production.
This sharing revision adds bilingual attribution headers and examples, without renewed integration/performance validation.
The included manifest.json records file digests; it is not a Foundry module.json.
Keep root `.gitattributes` and transfer files without text conversion; formatting/line-ending changes alter byte digests.

## Changes

| File | Change |
|---|---|
| `overlay/script/wrapper.js` | After native `_getDocuments`, immediately return results with no pack before waiting for translation; pack reads keep original initialization/translation |
| `overlay/script/babele.js` | Instance-private`#initializing`; `init()` shares a pending Promise around the unchanged body renamed`#initializeOnce()`; completion/failure clears it for future attempts |

Install **both together**. Early return alone allows concurrent ready/pack paths to initialize twice.
No translation disable, artificial delay, full-document/fog cache or bypass of waiting translated requests is introduced.

## Choose a delivery method

### A. Direct replacement in an independent test copy

Check for shared directories/symlinks, stop only the target test instance, back up original files privately,
and verify version and original digests:

| Original file | Original2.7.5 SHA256 |
|---|---|
| `<dataPath>/Data/modules/babele/script/babele.js` | `3727b7bb55d81fe63faf922aece7249457fb1cef8462b0cdfd581c7f620d096f` |
| `<dataPath>/Data/modules/babele/script/wrapper.js` | `0c9a16e28aa08e9968ddd270ad4b5770295ab8266d3bf874ed54880cd0f69474` |

Copy the two overlay/script files into those locations, preserving ownership/mode and every other upstream file.
Do not invent an upstream release version. Refuse mismatched hashes or changed files.
Backups must not be publicly served or automatically loaded.

### B. Single-domain Nginx serving override

Prefer considering this when original scripts are shared by several instances. Keep all original files/links unchanged.
Use separate assets and a server-scoped snippet:

```text
/var/www/fvtt-load-boost/babele-2.7.5/script/babele.js
/var/www/fvtt-load-boost/babele-2.7.5/script/wrapper.js
/etc/nginx/snippets/fvtt-babele-2.7.5.conf
```

Copy`nginx-overlay.example.conf`as the snippet and include it **only inside the intended HTTPS server block**,
not http context or a global include. Replace the example domain and verify the edge's origin Host.
Suggested dedicated ownership/modes: root:www-data directories0750/files0640; verify access through every parent.
Never use chmod777 or loosen the entire home directory. These Ubuntu paths were not created during packaging.

The two exact URLs return JavaScript/no-store, disable ETag/time-based304 and ranges, and accept GET/HEAD.
Neighbouring scripts, direct Foundry requests and other sites still use originals.
Never alias the entire modules directory or place private backups beside served assets.

### Transition safety

- Stage and verify both files before routing changes. Configuration checks/reloads are for a separately authorized future deployment.
- Two requests crossing a graceful reload can receive different generations. This is not an atomic client-bundle switch.
- Use a quiet window without new page loads. Require repeated correct pairs of hashes at origin and ordinary public URLs,
  not just200 or cache-busted checks.
- Only then reload clients completely; existing pages keep code already in memory.
- This delivery does not require Foundry/PM2 changes, but Nginx reload processes the entire configuration: protect other sites.
- With an edge service, verify real public responses; isolated no-store tests do not validate every edge node.

## Functionality and timing

Later two-samples/group first-frame medians were9.678/9.172/10.331s (original/candidate/restored):
0.51–1.16s earlier but overlapping ranges, not guaranteed gains.
Translation usually completed1.4–2s after the first frame; injected early reads could wait near3s. No fixed timer is used.

Acceptance must cover one translation load/dataLoaded/babele.ready, index/folder and real full-document translations,
pending requests waiting for correct output, player/GM list-sharing/UI, errors, permissions, quality and early interaction.
An active module flag is insufficient. Delayed translation does not permit missing functionality.
Existing OriginalNameFilter/context-note/empty-JSON and other module errors are not fixed by this patch.

## Rollback

For direct files: stop the target, verify no unrelated edits, restore both original backups, restart and fully reload.
For an overlay: remove only the snippet/rules, validate/reload, repeatedly verify both ordinary URLs return originals
without the policy header, then reload clients.
Do not delete assets referenced by old workers, rollback databases or remove translation data.

Static aliases do not automatically guard versions. Remove/review before changing Babele, Foundry or translation dependencies.
No automatic upload, installation, upgrade or publication action is supplied.
