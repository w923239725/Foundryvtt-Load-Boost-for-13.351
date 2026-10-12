# Nginx压缩与后续调优候选

[English](NGINX-TUNING.en.md) · [项目](../README.md)

CC BY 4.0，署名 Foundryvtt Load Boost for 13.351 contributors；[许可范围](../LICENSE.md)。
目标仍为Ubuntu22.04/Nginx1.18/Foundry13.351。本说明是静态分析，没有新增实测收益，
不授权服务操作，也不表示以下候选已经开启。

## 已提供的gzip全局配置

01和02都包含`nginx/nginx.conf`，目标位置为`/etc/nginx/nginx.conf`，其中`http {}`配置：

```nginx
gzip on;
gzip_vary on;
gzip_comp_level 1;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript
           text/javascript application/xml application/wasm image/svg+xml;
gzip_proxied off;
```

等级1和gzip_proxied off是把原先默认值写明，不是新增已验证提速。`text/html`原生包含。
等级越高通常越费CPU；不要默认用9。JPEG/WebP/ZIP/WOFF2等通常不值得再次压缩。
上游已经设置Content-Encoding时Nginx不重复gzip；实际完整链路可能由Foundry或CDN执行压缩。
请求未声明接受gzip、状态/类型/长度不合适时，不压缩不是错误。
这些HTTP响应设置不控制WebSocket消息压缩，不能减少规则计算或Babele翻译执行时间。

**安装已有站点时：保留原全局配置，合并缺失指令并调整已有同名指令；不要整文件覆盖或在同一层重复粘贴。**
只复制sites-available不会自动获得这些全局设置；检查http/server/location覆盖、MIME映射及include位置。
gzip是http/server/location指令，不能放在events内。若只为一个站点调整，可在适当server层配置，
避免影响其他站点。此前“全局参考文件曾被读取”不等于原服务器曾修改或采用了这份模板。

`gzip_proxied`依据请求的**Via头**判断是否经过代理，并非检查是否用了proxy_pass。
02保留off：若边缘带Via且上游未压缩，Nginx这一层可能不压缩；边缘仍可能压缩。
只有未来确认公开静态文件实际漏压缩，才评估在最小资源location使用`gzip_proxied any`。
不能从URL后缀就认定响应永远公开，须考虑认证、错误与包装路径；不要对敏感动态响应盲开压缩。

## 可评估的配置，不默认启用

| 优先考虑条件 | 候选 | 可能改善什么 | 代价与边界 |
|---|---|---|---|
| JS/CSS实际未压缩或压缩CPU成为瓶颈 | 修正有效gzip作用域/MIME/Via条件；比较`gzip_comp_level`1与4–5 | 下载字节或压缩CPU | 先确认究竟哪层压缩；Nginx等级不影响Foundry已编码正文。带宽与CPU取舍，无固定收益 |
| 存在大量重复TLS新连接 | 合理的`ssl_session_cache shared:...`及`ssl_session_timeout` | 会话恢复可能降低重复握手成本 | 不加速第一握手或既有HTTP/2连接；受客户端/TLS/ticket设置影响。边缘用户握手在CDN，源站只影响回源。多站点缓存范围需审查 |
| 证实上游频繁重连 | 调整现有keepalive池和空闲超时 | 减少连接建立 | 当前已有16连接池/4秒空闲设置；须配合Foundry实际keepalive，避免复用已被上游关闭的连接。不是越大越好 |
| 大响应触发代理临时文件且磁盘有压力 | 局部评估`proxy_buffers`及`proxy_busy_buffers_size` | 减少磁盘缓冲或改善吞吐 | 按并发增加内存；普通buffering已开启，不等全部正文才发。不要全局关闭缓冲或盲目设置巨大缓冲；socket.io保持off |
| 允许维护独立、纯公共静态副本 | 精确root/alias、`gzip_static on`及预压缩文件，必要时评估`open_file_cache` | 避免Node动态压缩/文件查找；减轻源程序负载 | 当前主要为proxy_pass；gzip_static不会自动压缩代理响应，open_file_cache不是HTTP响应缓存。须有模块、匹配.gz、发布同步/回退和访问边界，不能暴露整个Data目录 |
| 确认可长期缓存且有可靠版本键的公共资源 | 精确浏览器缓存或Nginx`proxy_cache`及合适失效 | 避免重复下载/回源 | 无版本键易旧代码；不能全局缓存登录/API/世界/模组目录。02已有边缘缓存，再加一层需管理双重失效；不是默认建议 |
| 高并发时FD/连接数确实耗尽 | `worker_connections`、文件描述符限制、worker容量 | 减少排队或拒绝连接 | 当前worker自动、连接数768；客户端与上游都占连接。只改大数不增加CPU/带宽，不改善单用户规则执行 |
| Nginx独占CPU或日志磁盘瓶颈有证据 | 合理日志缓冲、静态资源专用日志策略 | 减少逐请求写盘开销 | 缓冲可能丢失崩溃前日志，不能默认关闭访问/错误日志；保留故障和审计能力 |

HTTP/2、HTTP/1.1上游复用、WebSocket分流和常规响应缓冲已经配置。
HTTP/3、Brotli不是目标Nginx1.18标准环境里加一行即可获得的能力，涉及升级/模块/边缘配置，
本轮不引入。已有`sendfile`/`tcp_nopush`也不代表所有动态proxy_pass响应都会更快。

## 未来验证应看什么（本轮不执行）

区分浏览器→边缘、边缘→Nginx、Nginx→Foundry三段。HTTP/2协商与HTTP/1.1回源可以同时正确。
比较实际编码、传输字节、TTFB、握手/连接次数、Nginx/Node CPU、内存及临时磁盘；
冷/热缓存和单用户/并发分开，每次只改变一个条件，保留原配置及完整功能。
Nginx自身gzip_ratio不能代表上游或边缘的压缩比。世界ready/首帧要另测，不能把压缩率当加载提速率。

## 官方参考

- [gzip、类型、等级、Via条件](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
- [TLS会话及SSL设置](https://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [代理缓冲与缓存](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [预压缩静态文件](https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html)

在线文档会包含新版本指令；必须核对目标1.18支持范围，不能直接复制整页示例（包括过时加密套件）。
