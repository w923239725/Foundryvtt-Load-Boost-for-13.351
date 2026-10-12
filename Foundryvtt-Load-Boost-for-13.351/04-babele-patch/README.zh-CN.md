# 04：Babele 2.7.5 非合集解阻塞补丁

[English](README.en.md) · [项目首页](../README.md)

独立Nginx覆盖配置采用MIT，见[MIT全文](../LICENSE-MIT)；不会将Babele源码改为MIT。

**非官方修改版。** Babele原作与本项目新增修改均采用 **CC BY 4.0**，分别保留Simone和项目贡献者署名。
见[本子项目许可](LICENSE.md)；再分发时携带相邻`.license`通知及相关许可/归属说明，不暗示上游或Foundry背书。

这不是完整模组发行包，不可直接作为Foundry安装URL。
先合法取得 **Babele2.7.5** 和其原有依赖（lib-wrapper），再使用本目录两份修改文件。
其余文件、manifest、翻译文件和第三方库来自原模块，不在本包重复分发。
上游作者为 **Simone Ricciardi**，许可及修改归属见[第三方说明](../THIRD-PARTY-NOTICES.md)。

## 针对版本与验证范围

历史实验：Foundry13.351、Node20.18.0、PF1 11.11、Babele2.7.5、lib-wrapper1.13.5.1。
上游manifest声明minimum13、verified13.344；那不等于所有模组组合都兼容。
**不得把文件覆盖到Babele2.8/2.9或其他版本。**

同一逻辑经过26项局部合同、玩家/完整GM、pending读取、125索引/文件夹和22全文摘要、
磁盘替换/回退与精确URL代理演练；原生产尚未采用。
本次分享仅加双语归属头并整理示例，未重新执行集成或性能验证。
`manifest.json`记录本分享文件摘要，不等同于Foundry module.json。
保留根`.gitattributes`并按二进制方式传输文件；自动格式化或转换换行会改变字节摘要。

## 修改清单

| 文件 | 变化 |
|---|---|
| `overlay/script/wrapper.js` | 原生 `_getDocuments` 返回后，若`!args[1]?.pack`直接返回，不再等待无关翻译；有pack时保留原初始化和翻译路径 |
| `overlay/script/babele.js` | 新增私有`#initializing`；`init()`共享一次pending Promise，原主体改名`#initializeOnce()`；完成或失败后清pending，允许后续重试 |

**两文件是一组，不能只安装wrapper。** 只有early return会使ready和合集请求并发进入初始化，导致重复翻译加载和dataLoaded。
补丁没有关汉化，没有人工sleep，没有缓存完整文档或个人迷雾，也不省略后续译文请求等待。

## 部署位置：选择一种路径

### A. 独立测试副本直接替换

确认没有其他实例共享或软链接到该目录后，停目标测试实例，备份原文件，核对版本与原摘要：

| 原文件 | 原版2.7.5 SHA256 |
|---|---|
| `<dataPath>/Data/modules/babele/script/babele.js` | `3727b7bb55d81fe63faf922aece7249457fb1cef8462b0cdfd581c7f620d096f` |
| `<dataPath>/Data/modules/babele/script/wrapper.js` | `0c9a16e28aa08e9968ddd270ad4b5770295ab8266d3bf874ed54880cd0f69474` |

将overlay/script两文件复制到对应script位置，保留属主/权限；保留其余上游文件及manifest，不伪装上游新版本。
原摘要不匹配时停止，不强行覆盖。备份在非公开、非模块加载目录。
独立测试验收完成后才考虑其他环境；不要把这一段当生产执行授权。

### B. 单域名Nginx供给覆盖（共享目录时优先考虑）

保持所有原模块文件与软链接不动，仅向独立站点提供两文件副本：

```text
/var/www/fvtt-load-boost/babele-2.7.5/script/babele.js
/var/www/fvtt-load-boost/babele-2.7.5/script/wrapper.js
/etc/nginx/snippets/fvtt-babele-2.7.5.conf  # 来自 nginx-overlay.example.conf
```

在目标HTTPS`server {}`内部include该snippet，仅此站点使用；不能放进http层或所有站点公用include。
将`vtt.example.com`替换为实际站点域名，确认边缘Host转发仍匹配。
副本只需Nginx可读，建议独立root:www-data目录0750/文件0640；不得用chmod777或放宽整个home。
路径各级访问权限应由部署者核对。本次未创建这些Ubuntu目录。

规则只匹配两个精确URL；JS MIME、no-store、关闭ETag/时间条件304、关闭range，GET/HEAD允许。
附近模组文件、Foundry上游端口以及其他实例继续原版，不会因主域名供给而改变共享源文件。
不要把整个modules目录变成alias，不要把备份或私钥放在供给目录。

### 切换和缓存注意

- 先准备两文件，核对manifest摘要，再修改配置；Nginx检查/重载只在未来明确授权后执行。
- 平滑重载瞬间已观察到两个请求取得新旧混合文件；这是两请求跨配置代次的风险，不是原子bundle升级。
- 选择无人新开/刷新页面的短暂窗口。使用新连接连续核对两文件的来源站及普通公开URL字节；
  不能只检查200或只用cache-busting URL。
- 通过后让客户端完整刷新；已经加载的页面不会自动替换JS。
- 本方案不需要修改PM2或重启Foundry，但Nginx重载影响整个Nginx配置，应保护其他server块。
- 有Front Door时还需核对真实外部响应，不能以测试VM的no-store响应替代所有边缘节点验证。

## 功能与时间

后期两样本/组对照首帧中位数9.678/9.172/10.331s（原/候选/恢复），约早0.51–1.16s，
范围重叠，不保证固定收益。汉化通常晚于首帧1.4–2s；加入早期请求时等待可接近3s，不是固定延迟。

验收必须覆盖：

- 仍为一次loadTranslations、一次dataLoaded、一次babele.ready；
- 125索引/文件夹及实际完整文档译文与原版比较，不能只看汉化模组active；
- 初始化未完成时的文档读取等待正确译文；玩家与GM分享清单/UI行为；
- 新增报错、权限、画质及早期交互。汉化迟一点可接受不等于漏译可以接受。

原环境的OriginalNameFilter、context notes缺译、空JSON与其他模组错误仍保留。
不能因为结果与原版一致就声称原有汉化缺陷已修复。

## 回退

直接替换方式：停目标实例，确认当前是本候选且无他人改动，精确恢复备份两文件，恢复启动并整页刷新。
代理覆盖方式：移除仅本snippet的include/精确规则，检查并平滑重载，连续确认两个普通URL均返回原版且策略头消失，再整页刷新。
不要在旧worker仍引用副本时删除文件；不要回退数据库或删除翻译资料。

静态alias没有自动版本防护：升级Babele/Foundry/汉化依赖前先移除或重新审查覆盖。
本项目不提供自动上传、安装、版本升级或发布动作。
