# Foundryvtt Load Boost for 13.351: investigation and sharing notes

[简体中文](PROJECT-DESCRIPTION.zh-CN.md)

This document uses **CC BY 4.0**; independent code/configuration uses **MIT**, attributed to
**Foundryvtt Load Boost for 13.351 contributors**. Original Babele retains Simone's attribution;
modifications also use CC BY 4.0. Other dependencies are not relicensed.
License: https://creativecommons.org/licenses/by/4.0/ . [Scope and third-party boundaries](../LICENSE.md).

This project concerns the wait after logging into a world, until the map is usable and background initialization finishes.
The following lists **non-network problems and candidates found in this investigation**, not every possible Foundry loading issue.
Network/CDN setup and its incomplete before/after comparison are documented in subproject02.

## Environment and measurement rules

Foundry13.351, Node20.18.0, PF1 11.11, Babele2.7.5, Ubuntu22.04 and Nginx1.18.
The anonymized world had38 world actors,12 scenes, approximately2323 messages,57 active modules and125 packs.
The chat-reduction experiment used an earlier2322-message snapshot.
Chromium154 sidebar and155 independent-browser runs and differing viewports are not interchangeable baselines.
Instrumentation adds overhead; compare only within matching experimental groups.

- Stage duration is not entirely redundant work.
- Inclusive times contain child operations and must not be added again.
- A/B/A differences apply to that experiment, not all deployments.
- `game.ready`, `canvasReady`, first visible render completion and `babele.ready` are different milestones.
- Post-ready work can affect early interaction without delaying the initial map-ready signal.

## Numbered problems and causes

| ID | Area | Observed time/volume | Cause, status and limits |
|---|---|---|---|
| C1 | Chat history size/initialization | Older2322→20-message snapshot: JSON20.48MB→0.422MB; ready median27.360→26.244s, about1.12s lower; long tasks about1.70s lower | Deletes content; not lossless and not applied to production. Old tunnel measurements cannot be compared directly with later14s primary measurements |
| C2 | ckl-roll-bonuses preparation | Disabling it lowered ready median by1.23–1.43s; sampled associated chains2.23–2.26s but module self frames about0.21s | Wrappers include native work; disabling removes functionality/packs, so this is not a safe savings estimate |
| C3 | Inactive scenes/unlinked tokens | Eleven inactive scenes about1.03s;34 synthetic actors about0.98–1.05s inside scene preparation | Accessing token.actor creates separate synthetic actors; not repeated initialization of the same world actor. No scene removal/actorLink change |
| C4 | Whole document/rule initialization | About3.1–3.3s;38 world actors about1.7s | Includes C2/C3 and the subareas below. Much is required rule computation |
| C4.1 | rollData rebuilding/deep cloning | deepClone self samples0.70–0.76s;16488 Actor.getRollData calls:4908 cached,8384 refresh,3015 action cache:false,181 ordinary cold | Later changes depend on updated attributes; action code may mutate nested data. Skipping getters/sharing mutable caches changes hooks, results or errors |
| C4.2 | Formula parsing, construction/evaluation | BRF-associated inclusive chain0.58–0.59s; a different run's non-range safeRollSync0.38–0.39s | Different metrics, not additive. A reusable pure parse stage independent of current rollData has not been established |
| C4.3 | Multi-phase item/action preparation | 2357 items,2446 prep calls;89 second calls added about18ms;998 actions generated rollData3015 times | Inputs can differ between phases; object identity alone does not establish redundancy |
| C4.4 | Source dedupe/flag scans | 1954 of2017 general-source calls empty; max list4,414 comparisons;115584 flag reads but total helper5–6ms | Large-input microbenchmark improvements do not fit this world. Only10 truthy formula constructions |
| C4.5 | Action min/max/single ranges | 1998 calls each; max+single about0.098–0.105s | Each includes968 independent safeRollSync calls and unit-setting reads; merging can change random draws, errors and settings behavior |
| C4.6 | Repeated absent global-bonus setting defaults | 18090 enablement checks0.268–0.271s; native settings.get refinement0.262s and18090 different objects; actual bonus work3–5ms | Missing world Setting causes repeated default-document construction. Persisting{} is a possible configuration experiment, but changes existence/shared identity/future-default behavior; no write or gain validation performed |
| C5.1 | Initial pack index/folder rescans | 125 indexes+125 folder results,48100+597 rows each login;1.8–1.94s | Identical results rescanned. Process-local cache completed; original pack selection and user-handling flow retained |
| C5.2 | Later client extra-field indexes | 108 getIndex calls but58/59 backend reads across57 packs; work continues2–3s after ready | Native field cache already serves49/50 calls, only1–2 overlapping subsets. Extra fields are not all duplicates; deprioritized |
| C5.3 | Babele blocks non-pack reads | Apparent fog load0.72–1.01s; socket round trip about18ms, server10–11ms, document construction<1ms; most remaining wait in Babele.init | Wrapper waits for translation before checking pack. Personal fog is not a pack. Final isolated candidate works; not deployed to original production |
| C5.4 | Concurrent Babele initialization | First early-return candidate loaded translations and emitted dataLoaded twice | Ready callback and pack request entered unfinished init concurrently. Final instance-local pending Promise coalesces work and clears after failure |
| C6 | Canvas/first visible render | canvas.draw1.23–1.55s includes Babele wait; textures0.19–0.27s, Basis0.17–0.22s; first render0.75s in one run vs0.047s on reload | One-time cost not fully attributed. Settled CPU submission0.35ms is not GPU time/FPS. Scene had no walls/local lights; generic FPS module not shown to match |
| C7 | Existing module/translation exceptions | No isolated delay attribution | Missing OriginalNameFilter; SBC player undefined.id and GM undefined.push; empty localization JSON; BRF parse failures; missing context-note translations, duplicate IDs and missing assets. Error counts are not seconds |
| C8 | Initial world-response envelope | Older browser wait5.37–6.11s; server preparation/ack4.79–5.53s | Includes C5.1/C9; not another independent additive delay or a current post-optimization measurement |
| C9 | Login update notifications | System update query about2.47–3.29s | World response awaited an external version check; shipped system timestamp was not refreshed as expected. Login-scoped suppression explicitly reports disabled checks, not “up to date” |

## Completed acceleration work

| Work | Implementation | Measurement | Status |
|---|---|---|---|
| C9 login update suppression | Node preload+AsyncLocalStorage for the world request; `--noupdate` separately prevents core upgrades | Isolated A/B/A ready medians13.137 /9.960 /12.801s: about2.84–3.18s lower | Original fixed deployment applied; project03 generic bootstrap is newly prepared, not integration-retested |
| C5 initial-pack cache | Bounded process memory, cloned results, world/pack/fields/metadata context, database event invalidation and pending-read generations | Ready medians9.877 /8.688 /10.186s: about1.19–1.50s warm improvement; server1.69–1.73→0.479s | Original deployment applied; initial fill about2.05s does not receive the warm benefit |
| Babele early non-pack return+single flight | Two modified2.7.5 scripts; do not disable translation, permit earlier map; requested translated documents still wait | Revised two-samples/group first-frame medians9.678 /9.172 /10.331s:0.51–1.16s earlier, overlapping ranges. Translation usually finishes1.4–2s after first frame, later under load | Isolated validation complete; not production-deployed. Project04 carries the same logic plus attribution headers |
| Ubuntu reverse-proxy compatibility | Connection reuse, WebSocket handling, Range/encoding safeguards; conservative edge caching and probes | No isolated per-directive savings. Web-page metrics are descriptive only | Original topology changes were applied; sanitized01/02 templates are not runtime-validated |

Do not add C5/C9 results into a guaranteed total. C5 retained serialized results were about6.49MB,
estimated retained heap about11.9MiB. Its64MiB serialized budget is not a hard RAM cap.

Babele checks included26 local contracts,125 index/folder digests,22 full documents (13 items/8 actors/1 journal),
player/full-GM, pending early reads, single completion events and file/proxy delivery/withdrawal rehearsals.
Existing missing translations remain; this does not prove every interaction in every world.
A graceful Nginx reload produced a mixed pair of old/new scripts, requiring a quiet transition,
repeated two-file checks and a complete page reload afterward.

## Rejected, withdrawn or deprioritized approaches

| Approach | Reason |
|---|---|
| Skip rollData for constants | Counterexamples change hooks, errors, Haunt caches, formula mutation and access order. About0.13s of work is not safe savings |
| Set dedupe everywhere | Large-list benchmark wins, but actual lists mostly empty/max4. Runtime hunk withdrawn; tests retained |
| Cross-call formula-flag caches/snapshots | Only5–6ms total; dynamic registration/getters/construction/error compatibility costs outweigh evidence |
| Reuse max/single range result | Removes independent evaluation/settings reads; random/error semantics differ and max cannot always reconstruct single |
| PF1 Object.create/Proxy roll-data drafts | [!4547](https://gitlab.com/foundryvtt_pathfinder1e/foundryvtt-pathfinder1/-/merge_requests/4547) and [!4548](https://gitlab.com/foundryvtt_pathfinder1e/foundryvtt-pathfinder1/-/merge_requests/4548) unmerged,11/12 files; probes expose enumeration/JSON/array/Set/deletion problems |
| Delete chats/scenes or disable ckl | Changes content or mechanics. Diagnostic only, not this package's solution |
| Shared personal-fog cache | Wait was translation initialization; introduces user/privacy/permission risks |
| Overwrite a shared Babele directory | Multiple instances may symlink the scripts. Use a separately reviewed single-domain exact-URL overlay instead |
| One-line Babele early return alone | Caused duplicate initialization/events; superseded by single-flight candidate |
| Enable all Prime Performance defaults | Primarily steady rendering, not demonstrated startup bottleneck here; some defaults lower lighting resolution. Not installed |
| Generic settings memoization | Can hide live changes, wrapper errors and mutation semantics. Native configuration experiment remains unperformed |

## Contents and limitations

01 contains direct Ubuntu configuration;02 contains edge-enabled configuration and cloud settings with honest comparison limits;
03 is a disabled-by-default server extension rather than a client mod;04 contains the two Babele patches for a legitimately obtained2.7.5 installation.
All subprojects have bilingual human/AI instructions and target paths.

Files are local only, not published. This sharing revision received static preparation/privacy checks,
not renewed live validation; recipients must validate independently with authorization.
