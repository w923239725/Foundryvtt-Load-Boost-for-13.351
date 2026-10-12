# 01: Ubuntu direct reverse proxy

[简体中文](README.zh-CN.md) · [Project](../README.md)

Independent configuration uses **MIT**; documentation retains **CC BY 4.0**; see [license and attribution](LICENSE.md).
Nginx and Foundry themselves are not relicensed.

Target: Ubuntu22.04, Nginx1.18-style syntax and Foundry13.351. Browser→HTTPS Nginx→HTTP127.0.0.1:30000.
This sanitized configuration was statically prepared, **not runtime-validated as a new package**.

## Files and destinations

| File | Ubuntu destination |
|---|---|
| `nginx/nginx.conf` | `/etc/nginx/nginx.conf`, reference only |
| `nginx/sites-available/vtt.example.com.conf` | `/etc/nginx/sites-available/vtt.example.com.conf` |
| `nginx/sites-enabled/vtt.example.com.conf.link` | Describes a symlink, not a configuration to copy |
| `foundry/options.json` | Merge into `<dataPath>/Config/options.json` |

There are three configuration contents and one link, not four independent configurations.
Keep existing global Nginx configuration whenever possible; the original optimization did not modify that global file.

After preparing the site and confirming the destination does not already exist, an authorized administrator may create:

```bash
sudo ln -s ../sites-available/vtt.example.com.conf /etc/nginx/sites-enabled/vtt.example.com.conf
```

**Never copy the `.link` placeholder into sites-enabled**: Ubuntu's wildcard include would parse it as invalid Nginx syntax.
Do not use a force-overwrite link command or enable the same site via both conf.d and sites-enabled.

## Behavior

The included `nginx/nginx.conf` enables gzip with annotated settings for `/etc/nginx/nginx.conf`.
Merge its compression directives into an existing setup; check MIME/includes and lower-context overrides
without replacing unrelated configuration or duplicating same-context directives.
Copying only sites-available does not import global gzip settings. Level1 and gzip_proxied off explicitly retain defaults,
not universal compression. See [compression and tuning candidates](../reports/NGINX-TUNING.en.md).

- HTTP/1.1 upstream connection reuse; only upgrade requests receive `Connection: upgrade`.
- socket.io keeps long read/write timeouts with response buffering disabled. Timeouts are between I/O operations, not a guaranteed session lifetime.
- Core scripts/JS/MJS and CSS do not forward Range/If-Range; Nginx cannot generate ranges for them.
- Other Range requests ask Foundry for identity encoding. Normal requests retain the client's encoding capabilities.
- Foundry Cache-Control is preserved. No proxy_cache, forced seven-day media cache or CDN s-maxage is configured.
- X-Forwarded-For is replaced with the direct peer address. This template does not establish trust in a CDN/other proxy.

The range workaround addresses a version-dependent compressed partial-response inconsistency; it is not a universal speed optimization.
Core partial downloads are deliberately unavailable and other ranged content is uncompressed.

## Usage

1. Replace `vtt.example.com`, certificate paths and the backend port as appropriate. Obtain a valid certificate first;
   no certificates, private keys, ACME setup or automated issuance are supplied.
2. Inspect existing server blocks, TLS/security headers, aliases, authentication and multi-instance configuration. Merge locally rather than overwrite unrelated settings.
3. The example Foundry options mean: `hostname` is the external name, `port` the actual backend port,
   `proxyPort` the external443 port and `proxySSL:true` the external TLS state. Preserve every unrelated options field.
   CLI arguments may override options.
4. The data path is the actual Foundry `--dataPath`, for example `/srv/foundry-data`. Do not move existing data to fit the example.
5. A loopback upstream target does not force Foundry to listen only on loopback. Secure its binding/firewall independently,
   without locking out SSH or other instances.
6. Back up outside wildcard-loaded configuration directories. Changes require authorized maintenance; recipients should perform
   their own syntax and integration checks before deployment. Such checks were not executed in this packaging task.

Use either this project or02, not both. Nginx1.18's `listen ... ssl http2` syntax may need review for newer Nginx.
The single-domain template is not a complete default-host rejection or security-hardening policy.

## Rollback and privacy

Restore exact original site/options and original link state. Do not remove sites-enabled or world databases.
Nginx changes generally use an authorized graceful reload; Foundry option changes may require restarting only the target instance.
Do not assume all clients switch as soon as reload returns.

No C5/C9, Babele patch, CDN resources, real host identifiers or private logs are included here.
Keep backups, credentials and PM2 exports out of any public repository.
See [AI instructions](AGENTS.en.md).
