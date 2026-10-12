# AI说明：服务端扩展

[English](AGENTS.en.md)

- 先读根约束。此分享版新preload/C9依赖注入未实机复验；不以历史47测试冒充通用包验收。
- 默认关闭。不得代用户填入真实生产凭据/路径并启用；私有deployment.json不要提交。
- 运行目录示例`/opt/fvtt-load-boost`，配置`/etc/fvtt-load-boost/deployment.json`；真实app/data由使用者提供。
- 这是Node--require，不是Foundry客户端mod，不创建module.json或安装到Data/modules。
- 检查dataPath/port/executable/Node/包版本/源码摘要，拒绝不匹配；不删guard强行运行。
- 只加载一次新入口；它先装C9后装C5。不要叠加旧生产策略。
- C9仍保留手动包管理；C5不是完整世界/权限/迷雾缓存。不要扩大缓存范围。
- 不绕过数据库写入事件、legacy冲突或返回副本隔离。64MiB不是RAM硬限额。
- 已存在PM2/systemd配置需局部合并，不覆盖其他实例、不另起进程、不重置world参数。
- 以后部署须隔离测试和单独维护授权；回退移除preload并重启目标，不删除世界/在运行时删被引用文件。
- 原始数据库错误必须暴露；不要为了“加速成功”返回空数组或旧值掩盖失败。
