import Constants from './constants.js';

/**
 * Handle setting and fetching all settings in the module
 */
export default class Settings {
  // Settings keys
  static SHOW_PASSIVE_EFFECTS = 'showPassiveEffects';

  /**
   * Register all settings for the module
   */
  registerSettings() {
    game.settings.register(Constants.MODULE_ID, Settings.SHOW_PASSIVE_EFFECTS, {
      name: 'Show Passive Effects',
      hint: 'If enabled, passive effects will be shown in the panel.',
      scope: 'client',
      config: true,
      default: false,
      type: Boolean,
      onChange: () => game.dfreds.effectsPanel.refresh(),
    });
  }

  /**
   * Returns the game setting for showing passive effects
   *
   * @returns {boolean} true if passive effects should be shown
   */
  get showPassiveEffects() {
    return game.settings.get(
      Constants.MODULE_ID,
      Settings.SHOW_PASSIVE_EFFECTS
    );
  }
}
