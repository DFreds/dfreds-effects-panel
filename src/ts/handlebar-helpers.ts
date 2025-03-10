import { SECONDS } from "./constants.ts";
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

    #handleDemonLordRemainingTime(effect: any, remainingSeconds: any) {
        let tokenName;
        const specialDuration = foundry.utils.getProperty(
            effect,
            "flags.specialDuration",
        );
        if (specialDuration !== "None" && specialDuration !== undefined) {
            tokenName = fromUuidSync(
                effect.origin.substr(0, effect.origin.search(".Actor.")),
            )?.name;
            switch (specialDuration) {
                case "TurnEndSource":
                    remainingSeconds =
                        game.i18n.localize(EN_JSON.EffectsPanel.TurnEnd) +
                        ` [${tokenName}]`;
                    break;
                case "TurnStartSource":
                    remainingSeconds =
                        game.i18n.localize(EN_JSON.EffectsPanel.TurnStart) +
                        ` [${tokenName}]`;
                    break;
                case "TurnEnd":
                    remainingSeconds = game.i18n.localize(
                        EN_JSON.EffectsPanel.TurnEnd,
                    );
                    break;
                case "TurnStart":
                    remainingSeconds = game.i18n.localize(
                        EN_JSON.EffectsPanel.TurnStart,
                    );
                    break;
                case "NextD20Roll":
                    remainingSeconds = game.i18n.localize(
                        EN_JSON.EffectsPanel.NextD20Roll,
                    );
                    break;
                case "NextDamageRoll":
                    remainingSeconds = game.i18n.localize(
                        EN_JSON.EffectsPanel.NextDamageRoll,
                    );
                    break;
                case "RestComplete":
                    remainingSeconds = game.i18n.localize(
                        EN_JSON.EffectsPanel.RestComplete,
                    );
                    break;
                default:
                    remainingSeconds = specialDuration;
            }
            return remainingSeconds;
        }
        return null;
    }

    #registerRemainingTimeLabelHelper() {
        Handlebars.registerHelper("remainingTimeLabel", (effect, _options) => {
            const remainingSeconds = effect.remainingSeconds;
            if (game.system.id === "demonlord") {
                const dlResult = this.#handleDemonLordRemainingTime(
                    effect,
                    remainingSeconds,
                );
                if (dlResult) return dlResult;
            }
            if (remainingSeconds === Infinity && effect.turns) {
                if (effect.turns === 1) {
                    return game.i18n.localize(EN_JSON.EffectsPanel.OneTurn);
                } else {
                    return game.i18n.format(EN_JSON.EffectsPanel.ManyTurns, {
                        turns: effect.turns,
                    });
                }
            } else if (remainingSeconds === Infinity) {
                return game.i18n.localize(EN_JSON.EffectsPanel.Unlimited);
            } else if (remainingSeconds >= SECONDS.IN_TWO_YEARS) {
                return game.i18n.format(EN_JSON.EffectsPanel.ManyYears, {
                    years: Math.floor(remainingSeconds / SECONDS.IN_ONE_YEAR),
                });
            } else if (remainingSeconds >= SECONDS.IN_ONE_YEAR) {
                return game.i18n.localize(EN_JSON.EffectsPanel.OneYear);
            } else if (remainingSeconds >= SECONDS.IN_TWO_WEEKS) {
                return game.i18n.format(EN_JSON.EffectsPanel.ManyWeeks, {
                    weeks: Math.floor(remainingSeconds / SECONDS.IN_ONE_WEEK),
                });
            } else if (remainingSeconds > SECONDS.IN_ONE_WEEK) {
                return game.i18n.localize(EN_JSON.EffectsPanel.OneWeek);
            } else if (remainingSeconds >= SECONDS.IN_TWO_DAYS) {
                return game.i18n.format(EN_JSON.EffectsPanel.ManyDays, {
                    days: Math.floor(remainingSeconds / SECONDS.IN_ONE_DAY),
                });
            } else if (remainingSeconds > SECONDS.IN_TWO_HOURS) {
                return game.i18n.format(EN_JSON.EffectsPanel.ManyHours, {
                    hours: Math.floor(remainingSeconds / SECONDS.IN_ONE_HOUR),
                });
            } else if (remainingSeconds > SECONDS.IN_TWO_MINUTES) {
                return game.i18n.format(EN_JSON.EffectsPanel.ManyMinutes, {
                    minutes: Math.floor(
                        remainingSeconds / SECONDS.IN_ONE_MINUTE,
                    ),
                });
            } else if (remainingSeconds >= 2) {
                return game.i18n.format(EN_JSON.EffectsPanel.ManySeconds, {
                    seconds: remainingSeconds,
                });
            } else if (remainingSeconds === 1) {
                return game.i18n.localize(EN_JSON.EffectsPanel.OneSecond);
            } else {
                return game.i18n.localize(EN_JSON.EffectsPanel.Expired);
            }
        });
    }
}

export { HandlebarHelpers };
