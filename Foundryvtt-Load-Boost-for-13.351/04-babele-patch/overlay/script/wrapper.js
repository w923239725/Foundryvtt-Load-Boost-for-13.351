
/**
 * Babele 2.7.5 by Simone Ricciardi. Modified for this sharing project.
 * Source: https://gitlab.com/riccisi/foundryvtt-babele/-/tree/2.7.5
 * License: https://creativecommons.org/licenses/by/4.0/
 * Change: return non-compendium results before translation initialization.
 * 修改：非合集读取不等待翻译初始化；合集翻译仍走原路径。
 * See ../../README.en.md and the repository THIRD-PARTY-NOTICES.md.
 */
/**
 * Since foundry 0.8.+, translations are directly applied replacing the default ClientDatabaseBackend _getDocuments implementation
 * with a code that merge the incoming data with the mapped translations using LibWrapper.
 */
export function initWrapper() {

    if(!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
        ui.notifications.error(game.i18n.localize("BABELE.requireLibWrapperMessage"));
    }

    libWrapper.register('babele', 'CONFIG.DatabaseBackend._getDocuments', async function (wrapped, ...args) {
        const result = await wrapped(...args);
        if (!args[1]?.pack) return result;
        if(!game.babele) {
            return result;
        }

        if(!game.babele.initialized) {
            await game.babele.init();
        }

        const documentClass = args[0], query = args[1].query, options = args[1].options, index = args[1].index, pack = args[1].pack, user = args[2];
        if(!pack || !result || !game.babele.isTranslated(pack)) {
            return result;
        }

        if(index ?? options?.index) {
            return game.babele.translateIndex(result, pack);
        } else {
            return result.map(data => {
                return new documentClass(game.babele.translate(pack, data.toObject()), {pack});
            });
        }
    }, 'WRAPPER');

    /**
     * Necessary to solve a problem caused by the replacement of the index, even if already present, after reading the document.
     */
    libWrapper.register('babele', 'CompendiumCollection.prototype.indexDocument', function (wrapped, ...args) {
        const id = args[0].id;
        const idx = this.index.get(id);
        wrapped(...args);
        this.index.set(id, foundry.utils.mergeObject(this.index.get(id), idx));
    }, 'WRAPPER');
}