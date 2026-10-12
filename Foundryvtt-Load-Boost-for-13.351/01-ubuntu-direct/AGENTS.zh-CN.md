# AI 阅读与操作指南（中文）

[English](AGENTS.en.md)

## 本包是什么

这是 Ubuntu 22.04 / Nginx 1.18 风格 / Foundry v13 的**脱敏直连反代参考配置**。
发布准备阶段只做静态内容推敲，未运行本包的配置检查、安装、性能测试或浏览器验收。
不要将模板描述为已验证的生产配置，不要承诺节省秒数。

本包没有 Front Door 或其他 CDN 依赖，不能自行重新加入 CDN、云缓存规则或信任所有代理 IP。
用户接收本包不代表授权你部署、重启、开端口、改权限或公开发布。

## 文件映射与语法层级

| 源 | 目标 |
|---|---|
| `nginx/nginx.conf` | `/etc/nginx/nginx.conf`；参考，不默认覆盖 |
| `nginx/sites-available/vtt.example.com.conf` | `/etc/nginx/sites-available/vtt.example.com.conf` |
| `nginx/sites-enabled/vtt.example.com.conf.link` | 软链接规范，内容为 `../sites-available/vtt.example.com.conf` |
| `foundry/options.json` | 实际 `<dataPath>/Config/options.json`，只合并字段 |

- `.link` 是说明性占位文件，不是 Nginx 配置。不能部署到任何会被 include 的目录。
- 真正的启用项是 `/etc/nginx/sites-enabled/vtt.example.com.conf` 软链接。
- `map` 与 `upstream` 位于 `http` 层；站点文件应从 `http` 层加载。
- 不要把 map/upstream 移进 server，也不要对同一个站点重复 include。
- 单站点模板的 map/upstream 名称不是多实例命名方案。增加实例时必须检查冲突。
- JSON 中不能写注释、尾逗号或占位表达式；参数说明在 README 中。

## 静态语义与不变量

1. 外部 HTTPS 443 在 Nginx 终止；上游为本机 HTTP 30000 示例端口。
2. `hostname`、证书域名、server_name、跳转目标一致；port 与 upstream 一致。
3. 常规上游 HTTP/1.1 + keepalive；只有实际 Upgrade 请求才发送 Connection: upgrade。
4. socket.io 路径的升级头、长超时与非缓冲行为保留。
5. 核心 JS/CSS：不转发 Range/If-Range，`max_ranges 0`，隐藏不适用的 Accept-Ranges。
6. 其他带 Range 请求：上游使用 identity 编码；非 Range 请求保留浏览器编码能力。
7. 不覆盖上游 Cache-Control，不新增 public、s-maxage、CDN HIT 检查或 proxy_cache。
8. 不按媒体扩展名给动态或受限内容统一添加长效公共缓存。
9. 直连拓扑下不要信任客户端自报的 X-Forwarded-For；若实际有受信代理，先重新审查拓扑。
10. 不删除现有 options.json 字段；不将示例 port 强制覆盖多实例部署的现有端口。

## 接到使用或修改请求时

- 先区分“解释/静态审阅”“生成本地候选”和“实际部署”。只做用户授权的阶段。
- 若用户要求不验证，不执行 `nginx -t`、重载、网络请求或游戏登录来扩大任务。
- 若未来用户明确要求实际部署，应先取得环境与维护窗口信息，检查原文件、启用链接、
  include 布局、版本、域名、证书、启动参数及是否多个实例共享目录。
- 不凭这个模板推断当前服务器路径，不探测无关用户文件或秘密。
- 检查管理员权限，不用 chmod 777、不改 sudoers、不保存密码、不扩大主目录访问权限。
- 部署前在私有目录保存必要备份；不要把 backups、options 原件、PM2 dump 或日志写进公开分享包。
- 配置有漂移时停止并合并差异，不能用旧备份覆盖他人的新修改。
- 原站点已有 TLS/安全头/认证/ACME/监控等配置时，尽量局部合并，不能因示例没有就删除。
- 生产性能验证须由用户另行授权，不操作世界内容、令牌、聊天或合集来制造更快的结果。

## 发布约束

- 本目录仅准备分享素材，没有初始化远端仓库或发布。
- 除非用户明确要求，不运行 git commit/push，不创建 GitHub 仓库、Gist、Release 或附件。
- 只能使用示例域名、回环/保留地址和中性的占位目录。不得把真实服务器信息带回模板。
- 不附带真实私钥、证书、Cookie、许可文件、完整环境变量、机器日志或测试世界。
- 不把 C5/C9、Babele 或 ckl 的额外运行策略混入这份纯网络/反代配置分享包。

## 完成时如何说明

说明实际生成或更改的本地文件、未实施的动作和未验证的边界。
区分“配置经静态思考核对”与“在真实 Nginx/Foundry 中验证通过”。
如果只生成模板，就明确写“未部署、未发布、未运行实际验证”，不要使用成功上线措辞。
