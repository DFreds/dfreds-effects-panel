import { SECONDS } from "./constants.ts";
import { Settings } from "./settings.ts";

class HandlebarHelpers {
    #settings = new Settings();

    /**
     * Registers the handlebar helpers
     */
    registerHelpers(): void {
        this.#registerCanViewEffectDetailsHelper();
        this.#registerCanViewEffectsPanelHelper();
        this.#registerShowDurationOverlaysHelper();
        this.#registerRemainingTimeLabelHelper();
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

    #registerRemainingTimeLabelHelper() {
        Handlebars.registerHelper("remainingTimeLabel", (effect, _options) => {
            let remainingSeconds = effect.remainingSeconds;
            if (game.system.id === "demonlord") {
                let tokenName;
                let specialDuration = foundry.utils.getProperty(effect, 'flags.specialDuration');
                if (specialDuration !== 'None' && specialDuration !== undefined)
                {
                    tokenName = fromUuidSync(effect.origin.substr(0, effect.origin.search('.Actor.')))?.name;
                    switch (specialDuration) {
                      case 'TurnEndSource':
                        remainingSeconds = `TurnEnd [${tokenName}]`;
                        break
                      case 'TurnStartSource':
                        remainingSeconds = `TurnStart [${tokenName}]`;
                        break
                      default:
                        remainingSeconds = specialDuration;
                    } 
                    return remainingSeconds; 
                }
            }
            if (remainingSeconds === Infinity && effect.turns) {
                if (effect.turns === 1) {
                    return game.i18n.localize("EffectsPanel.OneTurn");
                } else {
                    return game.i18n.format("EffectsPanel.ManyTurns", {
                        turns: effect.turns,
                    });
                }
            } else if (remainingSeconds === Infinity) {
                return game.i18n.localize("EffectsPanel.Unlimited");
            } else if (remainingSeconds >= SECONDS.IN_TWO_YEARS) {
                return game.i18n.format("EffectsPanel.ManyYears", {
                    years: Math.floor(remainingSeconds / SECONDS.IN_ONE_YEAR),
                });
            } else if (remainingSeconds >= SECONDS.IN_ONE_YEAR) {
                return game.i18n.localize("EffectsPanel.OneYear");
            } else if (remainingSeconds >= SECONDS.IN_TWO_WEEKS) {
                return game.i18n.format("EffectsPanel.ManyWeeks", {
                    weeks: Math.floor(remainingSeconds / SECONDS.IN_ONE_WEEK),
                });
            } else if (remainingSeconds > SECONDS.IN_ONE_WEEK) {
                return game.i18n.localize("EffectsPanel.OneWeek");
            } else if (remainingSeconds >= SECONDS.IN_TWO_DAYS) {
                return game.i18n.format("EffectsPanel.ManyDays", {
                    days: Math.floor(remainingSeconds / SECONDS.IN_ONE_DAY),
                });
            } else if (remainingSeconds > SECONDS.IN_TWO_HOURS) {
                return game.i18n.format("EffectsPanel.ManyHours", {
                    hours: Math.floor(remainingSeconds / SECONDS.IN_ONE_HOUR),
                });
            } else if (remainingSeconds > SECONDS.IN_TWO_MINUTES) {
                return game.i18n.format("EffectsPanel.ManyMinutes", {
                    minutes: Math.floor(
                        remainingSeconds / SECONDS.IN_ONE_MINUTE,
                    ),
                });
            } else if (remainingSeconds >= 2) {
                return game.i18n.format("EffectsPanel.ManySeconds", {
                    seconds: remainingSeconds,
                });
            } else if (remainingSeconds === 1) {
                return game.i18n.localize("EffectsPanel.OneSecond");
            } else {
                return game.i18n.localize("EffectsPanel.Expired");
            }
        });
    }
}

export { HandlebarHelpers };
