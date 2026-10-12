# 02: Ubuntu with Front Door / a comparable edge service

[简体中文](README.zh-CN.md) · [Project](../README.md)

Independent configuration uses **MIT**; documentation retains **CC BY 4.0**; see [license and attribution](LICENSE.md).
Nginx, Foundry and Azure terms are unchanged.

Reference target: Ubuntu22.04, Nginx1.18, Foundry13.351. The edge must support HTTPS origins,
path routes, query-aware cache keys, WebSockets and origin cache directives.
This is not an ARM/Bicep/Terraform export and **has not been live-validated after repackaging**.
Choose this or01, not both.

## Destinations and setup

| File | Destination/use |
|---|---|
| `nginx/nginx.conf` | Reference for `/etc/nginx/nginx.conf`; do not blindly overwrite |
| `nginx/sites-available/vtt.example.com.conf` | Same filename under `/etc/nginx/sites-available/` |
| `nginx/sites-enabled/vtt.example.com.conf.link` | Link specification only; create the real sites-enabled symlink |
| `foundry/options.json` | Merge into actual `<dataPath>/Config/options.json` |
| `edge-settings.example.json` | Manual control-panel checklist, not an importable cloud resource |

See01 for symlink instructions; never put the `.link` placeholder into an included directory.
Use a real valid certificate and matching hostname/SNI/origin Host. The backend example is127.0.0.1:30000.
The cloud-origin example **192.0.2.10 is a documentation-only address, not a reachable origin**.
Supply your own reachable origin without disabling certificate-name validation.

## Edge configuration

**Global gzip config is included:** merge the annotated `nginx/nginx.conf` reference into `/etc/nginx/nginx.conf`.
Copying only the site does not import it. Check MIME/includes and lower-context overrides; do not replace
unrelated configuration or duplicate same-context directives. Level1 and gzip_proxied off retain defaults.
Via-bearing requests may not receive dynamic Nginx compression, while Foundry/the edge can still compress.
Global gzip_proxied any is not enabled. See [compression and tuning candidates](../reports/NGINX-TUNING.en.md).

1. Origin group: HTTPS443, Host `vtt.example.com`, certificate covering that hostname.
2. Probe: HTTPS **HEAD `/join`**, confirm an actual200 while the world is available.
   `/` may redirect;302 is not the same as the expected200.
3. Static route: `/scripts/*`, `/css/*`, `/fonts/*`, `/icons/*`; caching/compression on,
   **Use Query String** cache-key behavior. Respect `private`/`no-store`; do not force-cache all extensions or personalized API responses.
4. Default`/*` route: cache off, WebSockets forwarded. Specific routes must win over the default.
5. Do not expand shared caching to login, game, socket.io, modules, systems or world data.
6. Any cleanup of earlier broken cached responses requires an explicit, narrow scope; do not purge unrelated applications.

Nginx retains connection reuse and range safeguards. Only eligible successful public core JS/CSS gets
`public, max-age=0, s-maxage=300, must-revalidate`; ineligible cases get`no-store`.
Browsers revalidate while shared caches can retain eligible results for300 seconds.
Other paths retain origin cache policy; media is not blanket-forced into seven-day public caching.

By default, forwarded client IP is the direct peer, which may be an edge node.
Real-IP recovery requires separately established trusted proxy ranges, source identity and origin-access restrictions.
Never trust all addresses. Other providers differ in query caching, compression, probes and WebSocket semantics.

## Historical access comparison: not a controlled CDN-on/off test

The initial observation came from a misconfigured/ineffective edge setup, **not a controlled direct-origin no-CDN run**.
Use these labels rather than attributing all improvement to the CDN.

| Metric | Initial single observation | Three-run median after proxy/edge corrections | Descriptive difference |
|---|---:|---:|---:|
| Page load event | 1.715s | 1.229s | 0.486s lower, about28.3% |
| First contentful paint | 10.220s | 9.668s | 0.552s lower, about5.4% |
| World/canvas ready | Not captured | 14.136s | **Cannot calculate** |

Initial viewport and cache conditions were uncontrolled, and message count differed by one.
Later samples used a978×838 sidebar. The load event is not game readiness; FCP is not completed map rendering.
Do not claim28% faster complete game loading. This comparison predates C9/C5.
The separate older27s SSH-copy experiment is not a no-CDN baseline and is excluded.

## Operation and rollback

Back up both Ubuntu configuration and cloud route/origin settings privately. Merge only the target server block.
Verify actual data path/port and obtain certificates before authorized maintenance. Do not expose the backend port.
Rollback must restore local and cloud changes separately: restoring Nginx alone does not restore Front Door.
Do not publish subscription/resource IDs, origin addresses, credentials or certificate material.
See [AI instructions](AGENTS.en.md).
