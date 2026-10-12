# Foundry VTT：Ubuntu 直连 Nginx 反向代理配置参考

[English](README.en.md) · [项目首页](../README.md)

本子项目独立配置采用 **MIT**，文档保留 **CC BY 4.0**，见[许可与署名](LICENSE.md)。不改变Nginx/Foundry本体许可。

面向 **Ubuntu 22.04、Nginx 1.18 风格语法、Foundry VTT 13.351** 的中文分享模板。
用途是整理通用反代、连接复用、WebSocket 和压缩分段兼容配置，而不是分发某台服务器的完整配置。

**本目录是经过静态思考整理的脱敏示例，未对这个新组合运行 Nginx 检查、浏览器测试或部署验证。**
它不是开箱即用的生产安装包，不承诺固定节省多少秒。历史配置的运行经验不能替代接收者在自己环境中的验证。

## 一、适用范围与已经移除的内容

```text
浏览器 → HTTPS 443 → Ubuntu Nginx → HTTP 127.0.0.1:30000 → Foundry
```

本模板不依赖 Azure Front Door，也不依赖其他 CDN：

- 不包含 Front Door 健康探测、源站组、静态路由、规则集、查询参数策略或缓存清理操作。
- 删除 CDN 专用缓存决策 map，以及 `public, s-maxage=...` 等共享缓存响应头覆盖。
- 不配置 Nginx `proxy_cache`，不强制为素材扩展名设置长期公共缓存。缓存语义交还 Foundry。
- 没有信任 CDN 转发 IP 的配置；`X-Forwarded-For` 使用当前直连客户端地址，而不盲目信任客户端传入值。
- 保留的 Range/编码规则用于规避部分版本的 HTTP 响应兼容问题；它不要求链路中存在 Front Door。

如果 Nginx 前方仍有负载均衡、隧道或 CDN，本模板的客户端 IP 信任、TLS 拓扑与缓存假设需要重新设计，不能直接套用。

## 二、目录与实际存储位置

| 本仓库文件 | Ubuntu 部署位置 | 说明 |
|---|---|---|
| `nginx/nginx.conf` | `/etc/nginx/nginx.conf` | 全局参考模板；已有服务器优先保留现有全局配置，不要整文件覆盖 |
| `nginx/sites-available/vtt.example.com.conf` | `/etc/nginx/sites-available/vtt.example.com.conf` | 实际站点配置；包含 `http` 层的 map/upstream 和站点 server 块 |
| `nginx/sites-enabled/vtt.example.com.conf.link` | 创建 `/etc/nginx/sites-enabled/vtt.example.com.conf` **软链接** | `.link` 仅记录链接目标；不是可被 Nginx 直接加载的配置文件 |
| `foundry/options.json` | `<Foundry dataPath>/Config/options.json` | 合并字段的 JSON 示例，不是完整设置文件 |

所谓“四个位置”，实际是 **三份配置内容加一个启用站点的软链接**，不是四份互相独立的配置。
`nginx.conf` 在原优化工作中只是读取和核对的全局入口；这里新增的是通用参考模板，不应声称它原本也被优化修改过。

`dataPath` 以实际 Foundry 启动参数为准。例如启动参数为 `--dataPath=/srv/foundry-data`，
则对应 `/srv/foundry-data/Config/options.json`。这个路径只是示例，不要求迁移现有数据目录。

### sites-enabled 必须是软链接

在 Ubuntu 上确认目标文件已准备好、没有同名链接或配置冲突后，管理员可手动创建：

```bash
sudo ln -s ../sites-available/vtt.example.com.conf /etc/nginx/sites-enabled/vtt.example.com.conf
```

不要把仓库中的 `.link` 文件复制到 `/etc/nginx/sites-enabled/`。
Ubuntu 的 `include /etc/nginx/sites-enabled/*;` 会尝试解析其中所有文件，
把一行链接目标当配置读取会报错。这里不使用 `ln -sf`，以免悄悄覆盖现有配置。

## 三、配置内容说明

### 全局gzip文件已包含，不能只复制站点文件

本目录的`nginx/nginx.conf`已经开启gzip并附中文逐项注释，目标为`/etc/nginx/nginx.conf`。
已有服务器应合并其中压缩指令并核对MIME/include/下层覆盖，不要整文件覆盖或重复声明同层指令。
仅复制sites-available不会带入全局gzip配置。等级1和gzip_proxied off显式保留默认值，
不是强制全部响应压缩。完整机制及其他候选见[压缩与后续调优](../reports/NGINX-TUNING.zh-CN.md)。

### 1. Nginx 连接复用与 WebSocket

- `proxy_http_version 1.1` 与 upstream keepalive 配合，减少反复建立上游连接。
- 普通请求不发送上游 `Connection: close`；升级请求才发送 `Connection: upgrade`。
- `/socket.io/` 保持 WebSocket 升级与较长超时，关闭该路径的响应缓冲。
- 这里的 keepalive 数值只是保守示例，不表示已经按目标服务器容量调优。

### 2. 压缩与分段响应兼容

兼容性来源是部分 Foundry 版本在压缩分段响应时，正文长度与 `Content-Range` 对应关系可能不一致。
模板采取以下保守方式：

| 请求类别 | 行为 |
|---|---|
| 核心 `/scripts/` 下 JS/MJS、`/css/` 下 CSS | 不向上游发送 Range/If-Range，Nginx 也不再生成局部响应 |
| 其他文件的 Range 请求 | 保留 Range/If-Range，但向上游发送 `Accept-Encoding: identity` |
| 其他完整请求 | 保留浏览器支持的编码，允许正常压缩 |

代价是核心脚本的局部下载能力被有意关闭，其他分段下载不再使用压缩表示。
这是兼容性取舍，不是对所有版本都必需的加速项；如果使用不同 Foundry/Nginx 版本，应重新评估。
不要仅删除其中某条规则，却仍假定分段与压缩的关系保持正确。

### 3. Foundry 反代参数

`foundry/options.json` 必须是严格 JSON，因此中文解释写在这里，文件中不插入注释。

| 字段 | 示例 | 含义 |
|---|---|---|
| `hostname` | `vtt.example.com` | 对外域名，不包含 `https://` 或路径 |
| `port` | `30000` | Foundry 实际监听端口，与 Nginx upstream 对应 |
| `proxyPort` | `443` | 浏览器访问反向代理的外部端口，不会自行改变 Foundry 监听端口 |
| `proxySSL` | `true` | 外部入口由 HTTPS 提供服务 |

**只合并确实需要的字段，不要用这份四字段示例覆盖现有 options.json。**
保留管理员认证、世界启动、数据目录关联、其他服务和现有安全设置。
已有后端端口通常无需变更：将模板 upstream 的示例端口改成现有端口即可。
命令行参数可能覆盖配置文件，二者应核对一致。

这些字段不负责限制监听地址。Nginx 连接 `127.0.0.1` 也不代表 Foundry 已只绑定回环地址。
应通过 Foundry 支持的绑定设置或主机/云防火墙限制后端端口，避免公网绕过 Nginx。
不要照抄防火墙命令导致 SSH 或其他实例被阻断。

## 四、使用前需要人工确认

1. **替换示例域名与证书路径。** `vtt.example.com` 使用保留的示例域名，不对应原服务器。
   证书必须覆盖所用域名，模板不包含证书、密钥、自动签发任务或 ACME 配置。
   先走自己的证书签发流程；证书文件不存在时不能直接启用 HTTPS 模板。
2. **先检查现有布局。** 确认是否有多个 server 块、默认站点、同名 upstream/map、重复 include、
   非默认端口或其他游戏实例。示例只定义单个主域名，其他域名及 HTTP Host 的拒绝策略由现有站点管理。
3. **备份到非配置目录。** 备份放在受保护目录，不要放入 `sites-enabled` 或被通配 include 的目录。
   不要提交备份、整个 Foundry 数据目录或 PM2 导出文件到公开仓库。
4. **区别重载与重启。** Nginx 配置改变通常使用平滑重载；Foundry 启动参数改变可能需要重启对应实例。
   实际执行前确认维护窗口，不要重启所有实例。
5. **不要假设本模板已通过本机验证。** 本次整理明确不做实际验证；
   接收者部署前仍应自行执行配置检查，并在其维护窗口验证 HTTPS、WebSocket、登录、
   完整/Range 文件响应及缓存头。本文不附带自动执行脚本。

Nginx 1.18 使用这里的 `listen 443 ssl http2` 语法。较新的 Nginx 版本可能推荐其他 HTTP/2 写法；
应以所用版本为准，不能仅因有提示就机械替换其他配置。

## 五、恢复与维护

- 改动前记录三份配置内容和站点软链接的原状态。
- 出现问题时恢复原站点配置与原 Foundry 参数，不要删除世界数据库。
- 如果原本没有该站点链接，只撤销本次新增链接；不要删除整个 `sites-enabled` 目录。
- 恢复 Nginx 配置后仍需由管理员检查并重载；恢复 Foundry 参数可能需要重启对应实例。
- 已建立的 WebSocket 和正在加载的客户端可能跨越配置切换窗口，不应假定重载命令返回就代表所有请求已切换。
- 这些设置不是完整安全加固指南；认证、系统补丁、文件权限及网络访问策略仍需独立维护。

## 六、不包含的内容与隐私

本目录不包含 C9 登录更新检查策略、C5 合集索引缓存、Babele 改动、ckl 模组实验、
Azure 资源导出、真实域名/IP、真实用户名、实例名、世界名称、证书内容或登录凭据。

仅使用 `vtt.example.com`、回环地址 `127.0.0.1` 和通用示例目录。
没有 Git 远端配置、自动发布动作或推送脚本；整理者没有执行 commit、push、创建仓库或公开发布。
如你后续补充自己的配置，发布前再次检查域名、IP、令牌、私钥、证书及备份内容。

AI 使用说明见 [AGENTS.zh-CN.md](AGENTS.zh-CN.md) / [English](AGENTS.en.md)。它是操作约束和结构说明，不能当作用户对服务器修改的授权。
