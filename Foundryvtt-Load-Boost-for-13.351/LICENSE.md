# License scope and attribution / 许可范围与署名

**MIT for independent code/configuration; CC BY 4.0 for Babele-derived code and documentation.**
**独立代码/配置采用MIT；Babele派生代码与文档保留CC BY 4.0。**

[MIT全文 / MIT terms](LICENSE-MIT) · [CC BY 4.0全文 / CC BY terms](LICENSE) ·
[中文摘要（不代替条款）](https://creativecommons.org/licenses/by/4.0/deed.zh-hans) ·
[Official legal code](https://creativecommons.org/licenses/by/4.0/legalcode.en)

## Scope / 适用范围

On 2026-10-12 the owner selected MIT for independent authored code and configuration.
Babele-derived scripts (including the project's modifications) and documentation retain CC BY 4.0.
The table below defines file-level scope; neither license blanket-relicenses third-party software.
The owner grants only rights they can license and asserts no exclusive rights over facts or public-domain material.

2026-10-12所有者将独立自编写代码和配置改用MIT；Babele派生脚本（含本项目修改）及文档保留CC BY 4.0。
以下表格明确文件范围，两种许可都不覆盖另行许可的第三方软件。
仅授予所有者有权许可的权利，不对事实及公共领域内容主张排他权。

| Files / 文件范围 | Attribution and terms / 署名与条款 |
|---|---|
| All Markdown documents and `reports/` data / 所有Markdown文档及报告数据 | Project contributors; CC BY 4.0. Standalone code/configuration examples inside documentation may also be used under MIT, except Babele-derived excerpts / 文内独立代码配置示例另可按MIT使用，Babele派生片段除外 |
| `.gitignore`, `.gitattributes`, `01-ubuntu-direct/.gitignore` | Project contributors; MIT |
| Non-Markdown files in `01-ubuntu-direct/`, `02-ubuntu-edge/` / 两子项目配置、JSON、链接目标等 | Project contributors; MIT; no relicensing of Nginx/Foundry/Azure / 不改变这些软件许可 |
| `03-server-extension/*.cjs`, `lib/*.cjs`, `deployment.example.json` | Project contributors; MIT; dependencies not bundled / 不捆绑依赖 |
| `04-babele-patch/overlay/script/babele.js` and `wrapper.js` | Original Babele2.7.5: Simone (Simone Ricciardi), CC BY 4.0; modifications: project contributors, CC BY 4.0 / 原作与新增修改分别署名 |
| `04-babele-patch/nginx-overlay.example.conf` | Independent project configuration; MIT / 独立站点配置 |
| `04-babele-patch/manifest.json` | CC BY 4.0 metadata describing the Babele-derived files; its license fields apply to those scripts / 描述Babele派生文件的元数据，其许可字段指向这些脚本 |
| Adjacent `*.license` notices / 相邻许可通知 | Identify the source file's license; retain with source / 标识对应源码许可，随源码保留 |
| `LICENSE` | Unmodified official CC BY 4.0 legal text, not original project prose / 官方原文，不冒充原创 |
| `LICENSE-MIT` | MIT license text and project copyright notice / MIT正文及项目版权通知 |

“Foundryvtt Load Boost for 13.351 contributors” is the public attribution label for this project's contributions,
not a claim of authorship over Babele. No private personal identity is required in this package.
When a project URL is later published, retain that supplied source link with redistributed copies where reasonably practicable.

“Foundryvtt Load Boost for 13.351 contributors”用于署名本项目贡献，不表示拥有Babele原作。
本包不披露私人身份；日后正式提供项目来源URL时，再分发应在合理可行范围内一并保留。

## Reuse / 复用

### MIT code and configuration / MIT代码及配置

Use, copy, modify, distribute and sublicense under [LICENSE-MIT](LICENSE-MIT), including commercial use,
while retaining its copyright and permission notice in all copies or substantial portions.
This does not convert Babele-derived files to MIT. A standalone subproject/code copy must carry the applicable license text.

MIT允许使用、复制、修改、分发、再许可及商用；所有副本或实质部分须保留MIT版权及授权通知。
这不会将Babele派生文件改为MIT。单独复制子项目或代码时须一并携带适用许可正文。

### CC BY 4.0 documentation and Babele / CC BY 4.0文档与Babele

You may copy, share and adapt licensed content, including commercially, subject to CC BY 4.0.
Provide appropriate attribution, retain supplied copyright/license/disclaimer/source notices,
link to the license, and identify modifications (including previous modification notices).
Do not imply endorsement or impose legal/technical restrictions that prevent permitted uses.
CC BY 4.0 is not a ShareAlike license.

可复制、传播、修改，也可商用；须按条款适当署名，保留已提供的版权、许可、免责和来源通知，
链接许可并标明修改（含已有修改说明）。不得暗示原作者背书，或对获准使用施加额外法律/技术限制。
CC BY 4.0不是“相同方式共享”许可。

Suggested attribution for CC BY documentation / CC BY文档的建议署名：

> Based on Foundryvtt Load Boost for 13.351, by its contributors, licensed under CC BY 4.0
> (https://creativecommons.org/licenses/by/4.0/). Changes: describe your changes, or state unchanged.
>
> 基于 Foundryvtt Load Boost for 13.351 及其贡献者的作品，采用CC BY 4.0。
> 修改情况：说明你的修改，或注明未修改。

For Babele-derived files, additionally retain Simone's attribution, the upstream2.7.5 source link
and the modification details in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
Babele派生文件还必须保留Simone署名、上游2.7.5来源及第三方说明中的修改信息。

## Other rights and software / 其他权利及软件

This license does not grant trademark, patent, privacy or other rights outside its scope.
Foundry VTT remains separately licensed proprietary software. The package is intended only for use
with a licensed Foundry installation. Do not include Foundry binaries, license keys, commercial packs,
translations, images or third-party libraries without the relevant rights.
See the current [Foundry package-development terms](https://foundryvtt.com/article/license/).
References or API calls do not relicense the referenced software.

本许可不授予其范围外的商标、专利、隐私等权利。Foundry本体仍为另行许可的专有软件；
本包仅用于配合合法授权的Foundry安装。没有相应权利，不得追加分发Foundry程序、密钥、
商业合集、译文、图片或第三方库。引用或调用软件接口不改变被调用软件的许可。
Foundry相关包开发/发行义务由其当前有效协议规定，本项目不能代为授权。

The content is provided without warranties under the MIT disclaimer or CC BY Section5, as applicable.
Compatibility and historical measurements are not guarantees.
内容依适用的MIT免责条款或CC BY第5节按现状提供，不作担保；兼容说明与历史测量不构成保证。

## Operational instructions are not license restrictions / 操作约束不是许可附加限制

The “do not publish/deploy without authorization” instructions in README/AGENTS describe the owner's
current agent workflow and access to particular accounts/servers. They do not revoke or restrict
recipients' MIT or CC BY 4.0 rights to redistribute the respective content. Likewise, feature-preservation and
version-check recommendations describe this project's supported approach, not a prohibition on lawful adaptations.
Only the license's actual terms govern the licensed copyright permissions.

README/AGENTS中的“不得擅自发布/部署”针对所有者当前代理工作流及特定账号/服务器操作，
不限制接收者依据适用的MIT或CC BY 4.0再分发作品的权利。保留功能、版本检查等要求是本项目支持的技术路线，
不是禁止合法改编的附加许可条件。版权授权以正式许可条款为准。

## Review record / 核对记录

2026-10-12: independent code/configuration now uses MIT at the owner's request; documentation and Babele
remain CC BY 4.0. Existing CC grants, if previously received, are not retroactively revoked.
Runtime JS bytes and pinned hashes remain unchanged; only license notices/metadata/documentation are updated.
2026-10-12按用户要求调整许可范围；此前若已有效授予CC权利，不因本次改许可而追溯撤销。
运行JS字节与固定摘要不改，仅更新通知、元数据及文档。

On 2026-10-11 the local distribution was reviewed for file provenance, license scope, attribution,
old license references and unintended third-party bundles. Public Babele2.7.5 README explicitly
states CC BY 4.0; Foundry's old link is retained as historical context with the current link provided.
Runtime JavaScript bytes were left unchanged; adjacent `.license` files carry attribution without changing pinned hashes.
JSON and link-target files were not given invalid inline comments.

2026-10-11对本地分发目录核对了文件来源、许可范围、署名、旧许可链接及意外第三方包。
依据上游2.7.5 README的明确CC BY 4.0声明；Foundry旧链接作为历史记录保留，并提供当前链接。
运行JavaScript字节未改，以相邻`.license`文件补充归属，避免改变固定摘要。
JSON及软链接目标文件不插入非法注释。

This is a bounded, source-based compliance review, not a legal opinion or proof of all upstream rights.
No services were run, no files were published and no additional copyright holder's permission was fabricated.
这是有界、基于已见来源的合规整理，不是法律意见或对上游全部权利的保证。
没有运行服务、发布文件，也没有伪造任何额外授权。
