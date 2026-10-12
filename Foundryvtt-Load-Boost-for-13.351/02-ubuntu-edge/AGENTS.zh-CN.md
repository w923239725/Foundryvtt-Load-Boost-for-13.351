# AI说明：边缘部署

[English](AGENTS.en.md)

- 遵守根目录约束；这是静态模板，不是部署授权。01/02不能同时启用。
- 两Nginx路径、实际dataPath下options和sites-enabled软链接的含义同01；`.link`不能直接部署。
- edge-settings是手动清单，不是Azure可导入文件。不要凭空创建订阅ID、资源组、FDID或凭据。
- 必须保留具体静态路径与无缓存默认路由，不缓存登录/socket/world/module内容。
- 校验源站Host、TLS证书名、探测HEAD/join和普通请求路径；不能禁用证书验证来绕过错误。
- 不信任任意XFF，不加allow-all real IP，不未经授权开放源站或改变云访问权限。
- 不改变Range/identity和核心完整响应的配合；不要把成功公共核心资源的共享缓存规则泛化到所有请求。
- 明确早期数据缺少world-ready和严格无CDN组；不能捏造完整加载差值或归因净CDN收益。
- 检查/部署/清缓存须用户另行授权；本次不运行实际验证。备份local和cloud两个面，保护非目标站点。
- 共享目录、别名和多实例源站必须单独核对；恢复Nginx不等于恢复云端规则。
