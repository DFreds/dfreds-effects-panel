import Constants from './constants.js';

/**
 * Handle setting and fetching all settings in the module
 */
export default class Settings {
  // Settings keys
  static PASSIVE_EFFECTS_RIGHT_CLICK_BEHAVIOR =
    'passiveEffectsRightClickBehavior';
  static TEMPORARY_EFFECTS_RIGHT_CLICK_BEHAVIOR =
    'temporaryEffectsRightClickBehavior';
  static SHOW_DISABLED_EFFECTS = 'showDisabledEffects';
  static SHOW_PASSIVE_EFFECTS = 'showPassiveEffects';
  static SHOW_DURATION_OVERLAYS = 'showDurationOverlays';
  static VIEW_PERMISSION = 'viewPermission';
  static VIEW_DETAILS_PERMISSION = 'viewDetailsPermission';

  /**
   * Register all settings for the module
   */
  registerSettings() {
    const userRoles = {};
    userRoles[CONST.USER_ROLES.PLAYER] = game.i18n.localize(
      'EffectsPanel.SettingPlayer'
    );
    userRoles[CONST.USER_ROLES.TRUSTED] = game.i18n.localize(
      'EffectsPanel.SettingTrustedPlayer'
    );
    userRoles[CONST.USER_ROLES.ASSISTANT] = game.i18n.localize(
      'EffectsPanel.SettingAssistantGM'
    );
    userRoles[CONST.USER_ROLES.GAMEMASTER] = game.i18n.localize(
      'EffectsPanel.SettingGameMaster'
    );
    userRoles[5] = game.i18n.localize('EffectsPanel.SettingNone');

    const rightClickBehaviors = {};
    rightClickBehaviors[Constants.RIGHT_CLICK_BEHAVIOR.DIALOG] =
      game.i18n.localize('EffectsPanel.SettingDialog');
    rightClickBehaviors[Constants.RIGHT_CLICK_BEHAVIOR.DELETE] =
      game.i18n.localize('EffectsPanel.SettingDelete');
    rightClickBehaviors[Constants.RIGHT_CLICK_BEHAVIOR.DISABLE] =
      game.i18n.localize('EffectsPanel.SettingDisable');

    game.settings.register(
      Constants.MODULE_ID,
      Settings.SHOW_DISABLED_EFFECTS,
      {
        name: 'EffectsPanel.SettingShowDisabledEffects',
        hint: 'EffectsPanel.SettingShowDisabledEffectsHint',
        scope: 'client',
        config: true,
        default: true,
        type: Boolean,
        onChange: () => game.dfreds.effectsPanel.refresh(),
      }
    );

    game.settings.register(Constants.MODULE_ID, Settings.SHOW_PASSIVE_EFFECTS, {
      name: 'EffectsPanel.SettingShowPassiveEffects',
      hint: 'EffectsPanel.SettingShowPassiveEffectsHint',
      scope: 'client',
      config: true,
      default: false,
      type: Boolean,
      onChange: () => game.dfreds.effectsPanel.refresh(),
    });

    game.settings.register(
      Constants.MODULE_ID,
      Settings.SHOW_DURATION_OVERLAYS,
      {
        name: 'EffectsPanel.SettingShowDurationOverlays',
        hint: 'EffectsPanel.SettingShowDurationOverlaysHint',
        scope: 'client',
        config: true,
        default: true,
        type: Boolean,
        onChange: () => game.dfreds.effectsPanel.refresh(),
      }
    );

    game.settings.register(
      Constants.MODULE_ID,
      Settings.PASSIVE_EFFECTS_RIGHT_CLICK_BEHAVIOR,
      {
        name: 'EffectsPanel.SettingPassiveEffectsRightClickBehavior',
        hint: 'EffectsPanel.SettingPassiveEffectsRightClickBehaviorHint',
        scope: 'client',
        config: true,
        default: Constants.RIGHT_CLICK_BEHAVIOR.DISABLE,
        choices: rightClickBehaviors,
        type: String,
        onChange: () => game.dfreds.effectsPanel.refresh(),
      }
    );

    game.settings.register(
      Constants.MODULE_ID,
      Settings.TEMPORARY_EFFECTS_RIGHT_CLICK_BEHAVIOR,
      {
        name: 'EffectsPanel.SettingTemporaryEffectsRightClickBehavior',
        hint: 'EffectsPanel.SettingTemporaryEffectsRightClickBehaviorHint',
        scope: 'client',
        config: true,
        default: Constants.RIGHT_CLICK_BEHAVIOR.DIALOG,
        choices: rightClickBehaviors,
        type: String,
        onChange: () => game.dfreds.effectsPanel.refresh(),
      }
    );

    game.settings.register(Constants.MODULE_ID, Settings.VIEW_PERMISSION, {
      name: 'EffectsPanel.SettingViewPermission',
      hint: 'EffectsPanel.SettingViewPermissionHint',
      scope: 'world',
      config: true,
      default: CONST.USER_ROLES.PLAYER,
      choices: userRoles,
      type: String,
      onChange: () => game.dfreds.effectsPanel.refresh(),
    });

    game.settings.register(
      Constants.MODULE_ID,
      Settings.VIEW_DETAILS_PERMISSION,
      {
        name: 'EffectsPanel.SettingViewDetailsPermission',
        hint: 'EffectsPanel.SettingViewDetailsPermissionHint',
        scope: 'world',
        config: true,
        default: CONST.USER_ROLES.PLAYER,
        choices: userRoles,
        type: String,
        onChange: () => game.dfreds.effectsPanel.refresh(),
      }
    );
  }

  /**
   * Returns the game setting for the passive right-click behavior
   *
   * @returns {string} the string representing the behavior
   */
  get passiveEffectsRightClickBehavior() {
    return game.settings.get(
      Constants.MODULE_ID,
      Settings.PASSIVE_EFFECTS_RIGHT_CLICK_BEHAVIOR
    );
  }

  /**
   * Returns the game setting for the temporary right-click behavior
   *
   * @returns {string} the string representing the behavior
   */
  get temporaryEffectsRightClickBehavior() {
    return game.settings.get(
      Constants.MODULE_ID,
      Settings.TEMPORARY_EFFECTS_RIGHT_CLICK_BEHAVIOR
    );
  }

  /**
   * Returns the game setting for showing disabled effects
   *
   * @returns {boolean} true if disabled effects should be shown
   */
  get showDisabledEffects() {
    return game.settings.get(
      Constants.MODULE_ID,
      Settings.SHOW_DISABLED_EFFECTS
    );
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

  /**
   * Returns the game setting for showing duration overlays
   *
   * @returns {boolean} true if overlays should be shown
   */
  get showDurationOverlays() {
    return game.settings.get(
      Constants.MODULE_ID,
      Settings.SHOW_DURATION_OVERLAYS
    );
  }

  /**
   * Returns the game setting for view permission
   *
   * @returns {number} a number representing the chosen role
   */
  get viewPermission() {
    return parseInt(
      game.settings.get(Constants.MODULE_ID, Settings.VIEW_PERMISSION)
    );
  }

  /**
   * Returns the game setting for view details permission
   *
   * @returns {number} a number representing the chosen role
   */
  get viewDetailsPermission() {
    return parseInt(
      game.settings.get(Constants.MODULE_ID, Settings.VIEW_DETAILS_PERMISSION)
    );
  }
}
