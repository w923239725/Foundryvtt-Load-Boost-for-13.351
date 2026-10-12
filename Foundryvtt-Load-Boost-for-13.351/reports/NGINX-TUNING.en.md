# Nginx compression and further tuning candidates

[简体中文](NGINX-TUNING.zh-CN.md) · [Project](../README.md)

CC BY 4.0, attribution: Foundryvtt Load Boost for 13.351 contributors; [scope](../LICENSE.md).
Target remains Ubuntu22.04/Nginx1.18/Foundry13.351. Static analysis only:
no new measured gains, operational authorization or activation of the candidates below.

## Included global gzip configuration

Both01 and02 include `nginx/nginx.conf`, intended as a reference for `/etc/nginx/nginx.conf`.
Its `http {}` block contains:

```nginx
gzip on;
gzip_vary on;
gzip_comp_level 1;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript
           text/javascript application/xml application/wasm image/svg+xml;
gzip_proxied off;
```

Level1 and gzip_proxied off make previous defaults explicit; they are not newly proven speedups.
HTML is included implicitly. Higher levels usually cost more CPU; do not default to9.
JPEG/WebP/ZIP/WOFF2 usually do not benefit from recompression. Nginx does not gzip already Content-Encoded
upstream bodies again; Foundry or the edge may perform compression instead.
Responses not eligible by accepted encoding, status, type or length may legitimately remain uncompressed.
These settings do not configure WebSocket message compression or reduce rule/translation computation.

**Preserve existing global configuration; merge missing directives and edit existing ones rather than
overwriting the entire file or duplicating same-context directives.** Copying sites-available alone does
not import these global settings. Inspect http/server/location overrides, MIME mappings and includes.
Do not place gzip directives inside events. Site-specific changes can use the appropriate server context
to avoid affecting other sites. The original global file was inspected historically, not replaced with this template.

`gzip_proxied` identifies proxy requests by the incoming **Via header**, not by the presence of proxy_pass.
02 retains off: edge requests with Via and uncompressed upstream bodies may not be compressed by this Nginx,
although the edge may still compress them. Only after confirming an actual gap should an operator consider
`gzip_proxied any` in a narrowly scoped public-static location. A file suffix alone does not guarantee a
public response, including errors/authentication/wrappers; do not blindly enable compression for sensitive dynamic responses.

## Candidates, not enabled by default

| Evidence needed | Candidate | Potential benefit | Tradeoff or limitation |
|---|---|---|---|
| JS/CSS actually uncompressed, or compression CPU bottleneck | Correct effective gzip scope/MIME/Via handling; compare level1 with4–5 | Fewer bytes or less CPU | Identify the compression layer first; Nginx levels do not affect Foundry-encoded bodies. No guaranteed gain |
| Many repeated new TLS connections | Appropriate shared `ssl_session_cache` and `ssl_session_timeout` | Session resumption may reduce repeated handshakes | Not first handshakes/existing HTTP/2 connections; depends on client/TLS/tickets. Behind an edge this affects origin connections, not user-edge handshakes. Review multi-site sharing |
| Frequent upstream reconnects | Existing keepalive pool/idle-time tuning | Less connection setup | Already16 idle connections/4s timeout; match actual Foundry keepalive behavior to avoid stale reuse. Larger is not always better |
| Proxy temporary-file writes and disk pressure | Scoped `proxy_buffers`/`proxy_busy_buffers_size` tuning | Less disk buffering/better throughput | More memory per concurrent response. Buffering already on for normal traffic and does not require the entire body before sending. Do not disable globally or allocate huge buffers; socket.io remains off |
| Maintainable separate public-static copies | Exact root/alias, `gzip_static on`, precompressed assets; possibly `open_file_cache` | Avoid Node dynamic compression/file lookup work | Current routes mostly proxy_pass; gzip_static does not compress proxy responses automatically. open_file_cache is not an HTTP response cache. Requires module support, matching .gz files, synchronized releases/rollback and strict access scope |
| Public resources with reliable version keys and safe long-lived caching | Scoped browser cache or Nginx `proxy_cache` with invalidation | Fewer downloads/origin requests | Stale code without version keys; never blanket-cache login/API/world/module trees.02 already uses an edge cache; a second layer adds invalidation complexity |
| Proven connection/FD exhaustion at concurrency | worker_connections, descriptor limits, worker capacity | Less queuing/refusal | Already automatic workers/768 connections; both client and upstream consume capacity. Bigger limits do not create bandwidth/CPU or accelerate rules |
| Proven access-log disk or Nginx CPU pressure | Appropriate buffered logging/static log policy | Less per-request disk overhead | Buffering can lose recent logs on a crash; do not disable access/error logs by default. Preserve diagnostics/auditing |

HTTP/2, HTTP/1.1 upstream reuse, WebSocket separation and ordinary response buffering are already configured.
HTTP/3 and Brotli require version/module/edge decisions beyond a one-line change in the target1.18 environment;
neither is introduced here. Existing sendfile/tcp_nopush do not imply all dynamic proxy responses become faster.

## Future evaluation, not performed now

Distinguish browser→edge, edge→Nginx and Nginx→Foundry. HTTP/2 at the front and HTTP/1.1 upstream can both be correct.
Compare actual encoding/transfer bytes/TTFB/handshakes/connections, Nginx and Node CPU, memory and temporary disk.
Separate cold/warm caches and single/concurrent users; change one condition at a time and preserve functionality/rollback.
Nginx gzip_ratio does not measure compression performed by Foundry or an edge.
Measure world-ready/first frame separately; compression ratio is not a loading-speed improvement ratio.

## Official references

- [gzip types, levels and Via conditions](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
- [TLS sessions and SSL settings](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [Proxy buffering and caching](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Precompressed static files](https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html)

Online docs include newer directives: check1.18 support and never copy whole examples blindly, including obsolete cipher lists.
