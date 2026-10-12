# 03：服务端扩展包 C5 / C9

[English](README.en.md) · [项目首页](../README.md)

自编写代码/配置采用 **MIT**，说明文档保留 **CC BY 4.0**，见[许可与署名](LICENSE.md)。分发源码时保留相邻`.license`通知；
这些通知不参与运行，不改变固定源码摘要。Foundry及依赖本体不在本包中，也不重新许可。

**非官方Node预加载扩展，不是放进Data/modules就能工作的Foundry mod。**
目标固定：Foundry13.351.0、Node20.18.0、PF1 11.11、socket.io4.8.1、abstract-level2.0.2、classic-level2.0.0。
超出该组合必须重新审查，不能简单删除guard以强行使用。

## 验证状态

`lib/c5-login-read-cache.cjs`、`lib/c5-login-cache-adapter.cjs`沿用历史最终实现；
原实现经历47项隔离测试、真实影子比较及原部署验证。
本分享版新增通用`preload.cjs`，C9从固定路径改为依赖注入、日志改为受保护的console输出，
**这部分打包修改仅静态审阅，未重新运行集成/性能测试**。历史测试结果不自动覆盖此入口。

## 文件与目录

把此子目录的运行文件复制到独立位置，例如：

```text
/opt/fvtt-load-boost/
  preload.cjs
  lib/c5-login-read-cache.cjs
  lib/c5-login-cache-adapter.cjs
  lib/c9-login-update-policy.cjs
/etc/fvtt-load-boost/deployment.json  # 从deployment.example.json复制并人工编辑
```

应用目录示例`/opt/foundry/resources/app`必须含`main.js`、`package.json`和随Foundry提供的node_modules；
数据目录示例`/srv/foundry-data`是现有Foundry dataPath，不是新的世界目录。
不要将扩展放到共享公开素材目录。部署配置只让运行Foundry的账号读取，候选代码不应由Nginx写入。
本包不需要npm安装，使用Node内置模块和目标Foundry自带依赖。
保留仓库`.gitattributes`；C5库有字节摘要校验，不要自动格式化或转换换行后仍使用旧摘要。

## 配置与启动

1. 先检查版本/内部文件SHA、共享目录及原启动方式，备份启动配置；停止任何旧版C5/C9 preload重复加载。
2. 将示例复制到私有`deployment.json`，填写`applicationPath`、`dataPath`及实际端口。
3. 默认`enabled:false`，不会安装策略。经隔离验证后才显式改为`true`。
   `disableLoginUpdateChecks:true`开启C9；`compendiumCacheMode`可为`off`、`shadow`、`on`。
   shadow始终返回原始读并比较候选，多做工作，不是加速模式。
4. 示例为**手动阅读参考，不由本次任务执行**：

```bash
FVTT_LOAD_BOOST_CONFIG=/etc/fvtt-load-boost/deployment.json \
node --require /opt/fvtt-load-boost/preload.cjs \
  /opt/foundry/resources/app/main.js \
  --dataPath=/srv/foundry-data --port=30000 --noupdate
```

必须用`--dataPath=...`、`--port=...`各一次，值匹配私有配置。
入口先检查运行文件/dataPath/port，再安装C9、C5。没有配置或enabled=false时不安装。
检查失败会发`FVTT_LOAD_BOOST_GUARD`并不启用策略；其他运行时错误仍可能影响启动/登录，需恢复原入口，不保证任意错误无影响。

**systemd**：在现有服务的环境中设置`FVTT_LOAD_BOOST_CONFIG`，在原ExecStart的Node参数加入`--require ...`；
保留User、WorkingDirectory、Restart、原应用参数，勿启动第二个进程。实际重启须授权。

**PM2**：在既有目标应用的`node_args`中加入唯一`--require`入口，`env`设置配置路径；
保留script/cwd/interpreter/args及其他实例。仅重启目标应用并在验收后按原流程保存。
不要导出整个真实PM2 dump进本仓库，不提供可能误覆盖配置的一键命令。

## 作用与限制

- C9只在初始`world`请求上下文抑制核心/系统版本通知查询，明确返回“检查已禁用”，不声明版本最新。
  `--noupdate`单独阻止核心升级；C9不会禁用全部手动系统/模组包管理。
- C5只复用初始默认字段索引/文件夹，不缓存世界响应、聊天、个人迷雾或授权结果。
  原用户处理与pack选择仍执行；不把它描述为穷尽的权限审计。
- 返回独立拷贝，写入/清理/关闭失效，在途旧读取不回填；正常现代及legacy事件均监听，
  外部legacy消费者冲突时保守绕过。当前依赖可能报告三条legacy事件废弃提示。
- 512条目、64MiB序列化预算不是进程RAM上限；结果对象/键/副本/并发响应另占内存。
- 一次进程重启后需要填充缓存；不承诺第一个玩家更快。约1.19–1.50s热缓存ready改善仅是旧实验结果。
- 不支持打开数据库时外部替换文件；先停实例再离线维护。版本/源文件变更先撤销或重新审查策略。
- 日志只有安装/失效/请求计数等摘要，但实际运行错误可能含应用细节；运行日志不应公开。

## 验收与回退（由使用者未来执行）

配置检查、真实登录、C9标记、首次miss/后续hit、世界与译文完整性、修改后缓存失效都要验证；
不要把HTTP200或installed日志独自当验收。新环境的设置/模组组合需要独立验证。

回退最稳妥方式：从目标进程移除本包`--require`和环境配置，恢复原启动参数，重启**仅目标实例**。
也可先enabled=false并重启，但不要在进程仍引用文件时删除包。
进程内缓存随进程退出丢弃，无需回滚数据库。保留是否继续`--noupdate`这一独立原策略。

本包不附生产自动部署器、不修改Nginx，也不需要Azure配置。权限、维护窗口、失败恢复重启都须独立批准。
