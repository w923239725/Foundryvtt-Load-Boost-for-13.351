# AI说明：Babele补丁

[English](AGENTS.en.md)

- 读根约束及许可。只支持取得合法上游Babele2.7.5后的两文件覆盖；不是完整发行包，不生成伪module.json。
- 保留Simone Ricciardi归属、CC BY4.0链接与修改说明。公开作者信息不是用户服务器隐私。
- 原版与分享候选摘要在manifest；分享文件新增归属头，不能拿此前无归属头候选的SHA当当前文件摘要。
- 不修改汉化内容、规则、权限、视野或质量；必须保留完整pack翻译路径和失败重试。
- 两文件共同部署，不单独early return。不要改为全局缓存、取消初始化或忽略错误。
- 先检查原script目录是否被其他实例软链接；共享时不直接覆盖。只考虑目标server两个精确URL供给覆盖。
- overlay snippet只能include在目标HTTPS server内；版本固定副本需Nginx读取但不能公开备份。
- graceful reload不是两文件原子切换。安排窗口、反复验证两URL字节/头，再整页刷新。
- 实际外部Host、Front Door、权限和回退需新授权与现场验证；本包静态整理不等于部署许可。
- 汉化完成时间与地图首帧分开报告；检查真实中文文档、索引、文件夹、早期读取和GM，不以active/ready标记冒充功能无损。
- 没有穷尽所有规则/模块组合，保留既有错误限制。不要把本补丁用于其他Babele版本或悄悄升级依赖。
