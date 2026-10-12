# Babele patch license / Babele补丁许可

**Original:** Babele2.7.5 by **Simone (Simone Ricciardi)**, licensed under **CC BY 4.0**.
**Modifications:** **Foundryvtt Load Boost for 13.351 contributors**, also **CC BY 4.0**.
This is an unofficial modified version, not an upstream release or endorsement.

**原作：** Simone（Simone Ricciardi）的Babele2.7.5，许可 **CC BY 4.0**。
**新增修改：** Foundryvtt Load Boost for 13.351 contributors，同样采用 **CC BY 4.0**。
本包是非官方修改版，不是上游发行或背书。

- Upstream / 上游: https://gitlab.com/riccisi/foundryvtt-babele/-/tree/2.7.5
- Original license declaration / 原许可声明: https://gitlab.com/riccisi/foundryvtt-babele/-/blob/2.7.5/README.md
- Changes / 修改: non-pack reads return before translation initialization; concurrent initialization shares
  an instance-local pending Promise that clears on completion/failure; bilingual attribution header.
  非合集读取提前返回；并发初始化共享实例内pending Promise，完成/失败后清除；新增双语归属头。
- Foundry current terms / Foundry当前条款: https://foundryvtt.com/article/license/

The two `overlay/script/` sources retain upstream attribution and have adjacent `.license` notices.
The independent nginx-overlay.example.conf uses MIT ([terms](../LICENSE-MIT)); documentation and manifest metadata retain CC BY 4.0.
No Foundry software, translation packs or dependent libraries are bundled.

两个`overlay/script/`源文件保留原作者并有相邻`.license`说明；独立nginx-overlay.example.conf采用MIT，文档及manifest元数据保留CC BY 4.0。
没有捆绑Foundry程序、翻译合集或依赖库。

Preserve upstream/project credits, supplied notices and modification descriptions on redistribution;
link the license or supply its text. Include the root license and relevant third-party notices if
distributing this subproject separately. Do not imply official status. No warranty under license Section5.

再分发须保留上游/项目署名、已提供通知及修改说明，并提供许可链接或全文；
单独分发本子目录时一并携带根许可和相关第三方说明。不得暗示官方身份；依许可第5节不作担保。

[Full terms / 许可全文](../LICENSE) · [Scope / 范围](../LICENSE.md) ·
[Full upstream acknowledgments / 完整上游致谢](../THIRD-PARTY-NOTICES.md)
