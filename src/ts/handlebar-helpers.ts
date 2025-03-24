import { Settings } from "./settings.ts";

class HandlebarHelpers {
    #settings = new Settings();

    /**
     * Registers the handlebar helpers
     */
    register(): void {
        this.#registerCanViewEffectDetailsHelper();
        this.#registerCanViewEffectsPanelHelper();
        this.#registerShowDurationOverlaysHelper();
        this.#registerIconSizeHelper();
        this.#registerItemSizeHelper();
    }

    #registerCanViewEffectDetailsHelper() {
        Handlebars.registerHelper("canViewEffectDetails", () => {
            return game.user.role >= this.#settings.viewDetailsPermission;
        });
    }

    #registerCanViewEffectsPanelHelper() {
        Handlebars.registerHelper("canViewEffectsPanel", () => {
            return game.user.role >= this.#settings.viewPermission;
        });
    }

    #registerShowDurationOverlaysHelper() {
        Handlebars.registerHelper("showDurationOverlays", () => {
            return this.#settings.showDurationOverlays;
        });
    }

    #registerIconSizeHelper() {
        Handlebars.registerHelper("effectsPanelIconSize", () => {
            return this.#settings.iconSize;
        });
    }

    #registerItemSizeHelper() {
        Handlebars.registerHelper("effectsPanelItemSize", () => {
            return this.#settings.iconSize + 8;
        });
    }
}

export { HandlebarHelpers };
