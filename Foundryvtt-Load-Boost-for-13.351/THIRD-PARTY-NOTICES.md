# Attribution and reuse / 归属与复用

## Babele 2.7.5

The two files under `04-babele-patch/overlay/script/` are modified versions of Babele2.7.5 by
**Simone Ricciardi (Simone)**. They are not claimed as original works of this sharing project.

`04-babele-patch/overlay/script/` 中两文件基于 **Simone Ricciardi（Simone）** 的 Babele2.7.5，
已作修改，不冒充本项目原创或官方新发行版。

- Source / 来源: https://gitlab.com/riccisi/foundryvtt-babele/-/tree/2.7.5
- Original license statement / 上游许可声明: https://gitlab.com/riccisi/foundryvtt-babele/-/blob/2.7.5/README.md
- License / 许可: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
- Legal text / 许可正文: https://creativecommons.org/licenses/by/4.0/legalcode
- Local unmodified license text / 本地未修改许可全文: [LICENSE](LICENSE)
- Changes / 修改: early return for non-compendium results; one instance-local pending initialization promise;
  bilingual modification header. See the subproject README for exact behavior and risks.
- 上游README还声明适用 Foundry VTT “EULA - Limited License Agreement for module development v0.1.6”。
  / The upstream README also references Foundry's module-development EULA.
  Historical reference / 历史引用: `http://foundryvtt.com/pages/license.html` (now unavailable / 现已失效).
  Current Foundry terms / 当前有效Foundry条款: https://foundryvtt.com/article/license/
  The current package-development section governs publication as described there; do not treat the old version label
  as permission to ignore current terms. / 不得以历史版本号为由忽略当前包开发与更新发行条款。

The upstream README also acknowledges **@ariakas81** for Italian Dnd5e SRD translation collaboration
and **@tposney#1462** for tips. These credits are retained as upstream acknowledgments, not as authorship
claims for this patch. / 保留上游对两位贡献者的致谢，不表示他们参与本补丁。

The modifications are by **Foundryvtt Load Boost for 13.351 contributors** and are also offered under CC BY 4.0.
This is an **unofficial modified version**, not an upstream release or an endorsed product.
新增修改由本项目贡献者提供，同样采用CC BY 4.0；这是**非官方修改版**，不冒充上游发行或背书产品。

Keep these links, attribution and modification notices with redistributed copies. No endorsement by the upstream author is implied.
再分发时保留归属、许可和修改说明；不表示上游作者认可本项目。

## Foundry, PF1 and other software / 其他软件

Foundry VTT is separately licensed proprietary software. No Foundry application bundle, world, commercial compendium,
PF1 distribution or credentials are included. Module names and public issue links identify dependencies/evidence only.
Users must obtain required software and licenses independently.
The Node runtime, socket.io, abstract-level, classic-level, lib-wrapper, JSZip and FileSaver/saveAs
are referenced or used through the recipient's existing installation; their implementations are not
bundled here and are not relicensed under this project's MIT or CC BY 4.0 terms. Nginx and Azure services are likewise only configuration targets.
Any future bundling requires a separate license/notice review.

Foundry需单独取得合法许可，本包不包含其应用程序、世界、商业合集、PF1发行包或凭据。
文档中的模组名称和公开问题链接只用于说明依赖与证据。
Node、socket.io、abstract-level、classic-level、lib-wrapper、JSZip及FileSaver/saveAs仅为外部运行依赖或接口引用，
没有随包分发其实现，也不改为本项目的MIT或CC BY 4.0。Nginx/Azure仅为配置目标；以后若打包第三方组件必须另查其许可及通知要求。
本项目只适用于配合合法授权的Foundry运行；遵守Foundry包开发许可不等于获得商业合集/译文等其他内容的分发权。

## Newly authored materials / 新编写材料

The owner selected **MIT** for independent authored code/configuration on 2026-10-12.
Documentation and Babele-derived scripts, including project modifications, retain **CC BY 4.0**,
to the extent of the rights the owner can license.
Use **Foundryvtt Load Boost for 13.351 contributors** as the project contribution attribution.
This does not overwrite upstream authorship or grant rights in separately licensed software.
See [license scope and reuse instructions](LICENSE.md) and the [MIT terms](LICENSE-MIT) and [CC BY 4.0 terms](LICENSE).

所有者于2026-10-12将独立代码/配置改为 **MIT**；文档及Babele派生脚本（含新增修改）保留 **CC BY 4.0**，限于其有权许可的部分。
项目贡献署名使用 **Foundryvtt Load Boost for 13.351 contributors**，不覆盖原作者归属或另行许可的软件。
具体范围、免责和再分发说明见[许可范围](LICENSE.md)及[MIT全文](LICENSE-MIT)和[CC BY全文](LICENSE)。
