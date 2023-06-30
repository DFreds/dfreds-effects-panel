import Constants from './constants.js';
import Settings from './settings.js';

/**
 * Handles setting up all handlebar helpers
 */
export default class HandlebarHelpers {
  constructor() {
    this._settings = new Settings();
  }

  /**
   * Registers the handlebar helpers
   */
  registerHelpers() {
    this._registerCanViewEffectDetailsHelper();
    this._registerCanViewEffectsPanelHelper();
    this._registerShowDurationOverlaysHelper();
    this._registerRemainingTimeLabelHelper();
  }

  _registerCanViewEffectDetailsHelper() {
    Handlebars.registerHelper('canViewEffectDetails', () => {
      return game.user.role >= this._settings.viewDetailsPermission;
    });
  }

  _registerCanViewEffectsPanelHelper() {
    Handlebars.registerHelper('canViewEffectsPanel', () => {
      return game.user.role >= this._settings.viewPermission;
    });
  }

  _registerShowDurationOverlaysHelper() {
    Handlebars.registerHelper('showDurationOverlays', () => {
      return this._settings.showDurationOverlays;
    });
  }

  _registerRemainingTimeLabelHelper() {
    Handlebars.registerHelper('remainingTimeLabel', (effect, _options) => {
      const remainingSeconds = effect.remainingSeconds;
      if (remainingSeconds == Infinity && effect.turns) {
        if (effect.turns == 1) {
          return game.i18n.localize('EffectsPanel.OneTurn');
        } else {
          return game.i18n.format('EffectsPanel.ManyTurns', {
            turns: effect.turns,
          });
        }
      } else if (remainingSeconds == Infinity) {
        return game.i18n.localize('EffectsPanel.Unlimited');
      } else if (remainingSeconds >= Constants.SECONDS.IN_TWO_YEARS) {
        return game.i18n.format('EffectsPanel.ManyYears', {
          years: Math.floor(remainingSeconds / Constants.SECONDS.IN_ONE_YEAR),
        });
      } else if (remainingSeconds >= Constants.SECONDS.IN_ONE_YEAR) {
        return game.i18n.localize('EffectsPanel.OneYear');
      } else if (remainingSeconds >= Constants.SECONDS.IN_TWO_WEEKS) {
        return game.i18n.format('EffectsPanel.ManyWeeks', {
          weeks: Math.floor(remainingSeconds / Constants.SECONDS.IN_ONE_WEEK),
        });
      } else if (remainingSeconds > Constants.SECONDS.IN_ONE_WEEK) {
        return game.i18n.localize('EffectsPanel.OneWeek');
      } else if (remainingSeconds >= Constants.SECONDS.IN_TWO_DAYS) {
        return game.i18n.format('EffectsPanel.ManyDays', {
          days: Math.floor(remainingSeconds / Constants.SECONDS.IN_ONE_DAY),
        });
      } else if (remainingSeconds > Constants.SECONDS.IN_TWO_HOURS) {
        return game.i18n.format('EffectsPanel.ManyHours', {
          hours: Math.floor(remainingSeconds / Constants.SECONDS.IN_ONE_HOUR),
        });
      } else if (remainingSeconds > Constants.SECONDS.IN_TWO_MINUTES) {
        return game.i18n.format('EffectsPanel.ManyMinutes', {
          minutes: Math.floor(
            remainingSeconds / Constants.SECONDS.IN_ONE_MINUTE
          ),
        });
      } else if (remainingSeconds >= 2) {
        return game.i18n.format('EffectsPanel.ManySeconds', {
          seconds: remainingSeconds,
        });
      } else if (remainingSeconds === 1) {
        return game.i18n.localize('EffectsPanel.OneSecond');
      } else {
        return game.i18n.localize('EffectsPanel.Expired');
      }
    });
  }
}
