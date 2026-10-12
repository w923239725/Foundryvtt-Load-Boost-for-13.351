# 02：Ubuntu + Front Door / 类似边缘服务

[English](README.en.md) · [项目首页](../README.md)

独立配置采用 **MIT**，文档保留 **CC BY 4.0**，见[许可与署名](LICENSE.md)；不改变Nginx、Foundry或Azure的许可。

适用参考：Ubuntu22.04、Nginx1.18、Foundry13.351；边缘服务必须支持HTTPS回源、路径路由、
保留查询字符串的缓存键、WebSocket和源站缓存指令。本包不是Azure ARM/Bicep/Terraform导出。
**整理后未运行实际配置验证。与子项目01二选一，不同时部署。**

## 文件位置

| 文件 | 目标/用途 |
|---|---|
| `nginx/nginx.conf` | `/etc/nginx/nginx.conf`的参考，不默认整文件覆盖 |
| `nginx/sites-available/vtt.example.com.conf` | 同名文件放 `/etc/nginx/sites-available/` |
| `nginx/sites-enabled/vtt.example.com.conf.link` | 只说明链接目标，实际创建sites-enabled同名软链接，不能复制.link |
| `foundry/options.json` | 合并到实际`<dataPath>/Config/options.json`，保留其他字段 |
| `edge-settings.example.json` | 对照云端控制台手动配置，不可直接导入云资源 |

启用软链接方式见[01说明](../01-ubuntu-direct/README.zh-CN.md#sites-enabled-必须是软链接)。
示例后端127.0.0.1:30000；Foundry hostname/proxyPort/proxySSL用于外部域名/443/TLS。
云端示例地址192.0.2.10属于文档保留地址，**不可作为真实可达源站**。使用者必须填写自己的可达地址与有效证书，
保证HTTPS主机名/SNI及源站Host匹配，不关闭证书名称验证。

## 云端设置

**全局gzip文件已包含：** `nginx/nginx.conf`用于参考合并到`/etc/nginx/nginx.conf`，
有中文压缩注释；只复制站点文件不会带入它。检查MIME、include及下层覆盖，避免整文件替换或同层重复指令。
等级1和gzip_proxied off保留默认行为；Via回源请求可能不由Nginx动态压缩，但Foundry/边缘仍可压缩。
没有全局启用gzip_proxied any；条件及其他候选见[压缩与后续调优](../reports/NGINX-TUNING.zh-CN.md)。

1. 源站组：HTTPS回源443，Host为`vtt.example.com`。证书覆盖该主机名。
2. 健康探测：HTTPS **HEAD `/join`**，验证运行状态下实际200。`/`可能重定向；不要把302误当健康200。
3. 静态路由：`/scripts/*`、`/css/*`、`/fonts/*`、`/icons/*`，启用缓存/压缩，查询键使用 **Use Query String**。
   不得强制忽略`private`/`no-store`；不得不加区分地缓存所有扩展名或cookie/API响应。
4. 默认`/*`路由：缓存关闭，WebSocket正常转发。确认具体路径规则优先于通配默认路由。
5. 不把登录、游戏、socket.io、模组/系统/世界内容扩大为公共缓存。Nginx不为媒体统一强制七天缓存。
6. 只在明确范围内处理遗留错误缓存，部署操作或清缓存需使用者另行确认；不要全局清理其他应用。

主站Nginx保留连接复用、WebSocket与Range兼容规则。只对成功且允许公共缓存的核心JS/CSS产生
`max-age=0, s-maxage=300, must-revalidate`；不满足条件时`no-store`。
`max-age=0`让浏览器重验证，`s-maxage=300`允许共享缓存最多300秒；这不是隐藏更新的无限缓存。
其他字体/图标响应保持原Cache-Control，由边缘按有效策略决定。

默认`X-Forwarded-For`覆盖为连接对端，可能记录边缘节点而非用户IP。恢复真实IP必须在限定受信边缘地址、
来源身份及源站访问限制后单独设计；本包不提供信任0.0.0.0/0或`::/0`的配置。
不同提供商在查询缓存、压缩分段、探测和WebSocket上语义可能不同，不能机械翻译控制台选项。

## 早期与修正后的访问数据（不是严格“有/无CDN”对照）

最早记录来自Front Door设置有问题、缓存效果不足的阶段，**并未记录一组完全绕过CDN且条件一致的数据**。
因此只能写“早期错误/低效配置”和“修正代理及边缘配置后”，不能写成证实CDN净提升。

| 指标 | 早期单样本 | 修正后3次中位数 | 描述性差值 |
|---|---:|---:|---:|
| 页面load事件 | 1.715s | 1.229s | 少0.486s，约28.3% |
| 首次内容绘制FCP | 10.220s | 9.668s | 少0.552s，约5.4% |
| 世界/画布ready | 未捕获 | 14.136s | **无法计算** |

早期窗口尺寸未知、浏览器缓存未控制、世界聊天数量相差1；后期为978×838侧栏窗口。
load事件不是游戏可用时间，FCP不是完整地图渲染。不能据上述数字声称完整游戏加载提高28%。
此组发生在C9/C5之前；另一个约27s的旧SSH副本实验不是无CDN基准，不纳入比较。

## 使用、回退与限制

先备份本地原配置和云端路由/源站设置；只合并目标server块。取得证书、确认真实端口和数据目录，
不开放后端端口以绕过Nginx。Nginx及Foundry变更按使用者授权窗口操作。
回退须分别恢复Ubuntu配置与云端设置，**恢复一个Nginx文件不等于恢复Front Door**。
证书、云资源ID、订阅ID、源站真实地址和访问令牌均不应提交到分享仓库。
详见[AI说明](AGENTS.zh-CN.md)与根目录证据口径。
