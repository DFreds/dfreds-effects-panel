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
  static VIEW_PERMISSION = 'viewPermission';
  static VIEW_DETAILS_PERMISSION = 'viewDetailsPermission';

  /**
   * Register all settings for the module
   */
  registerSettings() {
    const userRoles = {};
    userRoles[CONST.USER_ROLES.PLAYER] = 'Player';
    userRoles[CONST.USER_ROLES.TRUSTED] = 'Trusted Player';
    userRoles[CONST.USER_ROLES.ASSISTANT] = 'Assistant GM';
    userRoles[CONST.USER_ROLES.GAMEMASTER] = 'Game Master';
    userRoles[5] = 'None';

    const rightClickBehaviors = {};
    rightClickBehaviors[Constants.RIGHT_CLICK_BEHAVIOR.DELETE] = 'Delete';
    rightClickBehaviors[Constants.RIGHT_CLICK_BEHAVIOR.DISABLE] = 'Disable';

    game.settings.register(
      Constants.MODULE_ID,
      Settings.SHOW_DISABLED_EFFECTS,
      {
        name: 'Show Disabled Effects',
        hint: 'If enabled, disabled effects will be shown in the panel with a grey tint.',
        scope: 'client',
        config: true,
        default: true,
        type: Boolean,
        onChange: () => game.dfreds.effectsPanel.refresh(),
      }
    );

    game.settings.register(Constants.MODULE_ID, Settings.SHOW_PASSIVE_EFFECTS, {
      name: 'Show Passive Effects',
      hint: 'If enabled, passive effects will be shown in the panel.',
      scope: 'client',
      config: true,
      default: false,
      type: Boolean,
      onChange: () => game.dfreds.effectsPanel.refresh(),
    });

    game.settings.register(
      Constants.MODULE_ID,
      Settings.PASSIVE_EFFECTS_RIGHT_CLICK_BEHAVIOR,
      {
        name: 'Passive Effects Right-Click Behavior',
        hint: 'This defines the behavior when right-clicking a passive effect.',
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
        name: 'Temporary Effects Right-Click Behavior',
        hint: 'This defines the behavior when right-clicking a temporary effect.',
        scope: 'client',
        config: true,
        default: Constants.RIGHT_CLICK_BEHAVIOR.DELETE,
        choices: rightClickBehaviors,
        type: String,
        onChange: () => game.dfreds.effectsPanel.refresh(),
      }
    );

    game.settings.register(Constants.MODULE_ID, Settings.VIEW_PERMISSION, {
      name: 'View Permission',
      hint: 'This defines the minimum permission level to see the effects panel. Setting this to None will never show the effects panel.',
      scope: 'world',
      config: true,
      default: CONST.USER_ROLES.GAMEMASTER,
      choices: userRoles,
      type: String,
      onChange: () => game.dfreds.effectsPanel.refresh(),
    });

    game.settings.register(
      Constants.MODULE_ID,
      Settings.VIEW_DETAILS_PERMISSION,
      {
        name: 'View Details Permission',
        hint: 'This defines the minimum permission level to see the details of the effects in the panel such as the duration and description. Setting this to None will never show any details.',
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
