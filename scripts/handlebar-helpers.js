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
    this._registerCanShowDisabledEffectsHelper();
    this._registerCanShowPassiveEffectsHelper();
    this._registerCanViewEffectDetailsHelper();
    this._registerCanViewEffectsPanelHelper();
    this._registerRemainingTimeLabelHelper();
  }

  _registerCanShowDisabledEffectsHelper() {
    Handlebars.registerHelper('canShowDisabledEffects', () => {
      return this._settings.showDisabledEffects;
    });
  }

  _registerCanShowPassiveEffectsHelper() {
    Handlebars.registerHelper('canShowPassiveEffects', () => {
      return this._settings.showPassiveEffects;
    });
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

  _registerRemainingTimeLabelHelper() {
    Handlebars.registerHelper('remainingTimeLabel', (effect, _options) => {
      const remainingSeconds = effect.remainingSeconds;
      if (remainingSeconds == Infinity && effect.turns) {
        if (effect.turns == 1) {
          return '1 turn';
        } else {
          return `${effect.turns} turns`;
        }
      } else if (remainingSeconds == Infinity) {
        return 'Unlimited';
      } else if (remainingSeconds >= Constants.SECONDS.IN_TWO_YEARS) {
        return `${Math.floor(
          remainingSeconds / Constants.SECONDS.IN_ONE_YEAR
        )} years`;
      } else if (remainingSeconds >= Constants.SECONDS.IN_ONE_YEAR) {
        return '1 year';
      } else if (remainingSeconds >= Constants.SECONDS.IN_TWO_WEEKS) {
        return `${Math.floor(
          remainingSeconds / Constants.SECONDS.IN_ONE_WEEK
        )} weeks`;
      } else if (remainingSeconds > Constants.SECONDS.IN_ONE_WEEK) {
        return '1 week';
      } else if (remainingSeconds >= Constants.SECONDS.IN_TWO_DAYS) {
        return `${Math.floor(
          remainingSeconds / Constants.SECONDS.IN_ONE_DAY
        )} days`;
      } else if (remainingSeconds > Constants.SECONDS.IN_TWO_HOURS) {
        return `${Math.floor(
          remainingSeconds / Constants.SECONDS.IN_ONE_HOUR
        )} hours`;
      } else if (remainingSeconds > Constants.SECONDS.IN_TWO_MINUTES) {
        return `${Math.floor(
          remainingSeconds / Constants.SECONDS.IN_ONE_MINUTE
        )} minutes`;
      } else if (remainingSeconds >= 2) {
        return `${remainingSeconds} seconds`;
      } else if (remainingSeconds === 1) {
        return '1 second';
      } else {
        return 'Expired';
      }
    });
  }
}
