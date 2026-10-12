# AI entry / AI入口

Read [root instructions](../AGENTS.md), then [English](AGENTS.en.md) or [中文](AGENTS.zh-CN.md).
先读根约束及对应语言说明；这些文件不授权部署。Documentation does not authorize deployment.

Read the [gzip/tuning notes](../reports/NGINX-TUNING.en.md) / [压缩调优说明](../reports/NGINX-TUNING.zh-CN.md).
Merge global gzip directives without duplicate declarations; candidate settings are not approved changes.
全局gzip须合并并检查继承，不重复声明；未验证候选不得直接启用，不为本轮运行服务。
