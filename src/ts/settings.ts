import { MODULE_ID, RIGHT_CLICK_BEHAVIOR } from "./constants.ts";

class Settings {
    // Settings keys
    #PASSIVE_EFFECTS_RIGHT_CLICK_BEHAVIOR = "passiveEffectsRightClickBehavior";
    #TEMPORARY_EFFECTS_RIGHT_CLICK_BEHAVIOR =
        "temporaryEffectsRightClickBehavior";

    #ICON_SIZE = "iconSize";
    #SHOW_DISABLED_EFFECTS = "showDisabledEffects";
    #SHOW_PASSIVE_EFFECTS = "showPassiveEffects";
    #SHOW_DURATION_OVERLAYS = "showDurationOverlays";

    #ALLOW_RIGHT_CLICK = "allowRightClick";
    #VIEW_PERMISSION = "viewPermission";
    #VIEW_DETAILS_PERMISSION = "viewDetailsPermission";

    register(): void {
        const userRoles: Record<number, string> = {};
        userRoles[CONST.USER_ROLES.PLAYER] = game.i18n.localize(
            "EffectsPanel.SettingPlayer",
        );
        userRoles[CONST.USER_ROLES.TRUSTED] = game.i18n.localize(
            "EffectsPanel.SettingTrustedPlayer",
        );
        userRoles[CONST.USER_ROLES.ASSISTANT] = game.i18n.localize(
            "EffectsPanel.SettingAssistantGM",
        );
        userRoles[CONST.USER_ROLES.GAMEMASTER] = game.i18n.localize(
            "EffectsPanel.SettingGameMaster",
        );
        userRoles[5] = game.i18n.localize("EffectsPanel.SettingNone");

        const rightClickBehaviors: Record<string, string> = {};
        rightClickBehaviors[RIGHT_CLICK_BEHAVIOR.DIALOG] = game.i18n.localize(
            "EffectsPanel.SettingDialog",
        );
        rightClickBehaviors[RIGHT_CLICK_BEHAVIOR.DELETE] = game.i18n.localize(
            "EffectsPanel.SettingDelete",
        );
        rightClickBehaviors[RIGHT_CLICK_BEHAVIOR.DISABLE] = game.i18n.localize(
            "EffectsPanel.SettingDisable",
        );

        game.settings.register(MODULE_ID, this.#SHOW_DISABLED_EFFECTS, {
            name: "EffectsPanel.SettingShowDisabledEffects",
            hint: "EffectsPanel.SettingShowDisabledEffectsHint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => game.dfreds.effectsPanel.refresh(),
        });

        game.settings.register(MODULE_ID, this.#SHOW_PASSIVE_EFFECTS, {
            name: "EffectsPanel.SettingShowPassiveEffects",
            hint: "EffectsPanel.SettingShowPassiveEffectsHint",
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: () => game.dfreds.effectsPanel.refresh(),
        });

        game.settings.register(MODULE_ID, this.#SHOW_DURATION_OVERLAYS, {
            name: "EffectsPanel.SettingShowDurationOverlays",
            hint: "EffectsPanel.SettingShowDurationOverlaysHint",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: () => game.dfreds.effectsPanel.refresh(),
        });

        game.settings.register(MODULE_ID, this.#ICON_SIZE, {
            name: "EffectsPanel.SettingIconSize",
            hint: "EffectsPanel.SettingIconSizeHint",
            scope: "client",
            config: true,
            type: new foundry.data.fields.NumberField({
                min: 16,
                max: 100,
                step: 1,
                initial: 42,
            }),
            onChange: () => game.dfreds.effectsPanel.refresh(),
        });

        game.settings.register(
            MODULE_ID,
            this.#PASSIVE_EFFECTS_RIGHT_CLICK_BEHAVIOR,
            {
                name: "EffectsPanel.SettingPassiveEffectsRightClickBehavior",
                hint: "EffectsPanel.SettingPassiveEffectsRightClickBehaviorHint",
                scope: "client",
                config: true,
                default: RIGHT_CLICK_BEHAVIOR.DISABLE,
                choices: rightClickBehaviors,
                type: String,
                onChange: () => game.dfreds.effectsPanel.refresh(),
            },
        );

        game.settings.register(
            MODULE_ID,
            this.#TEMPORARY_EFFECTS_RIGHT_CLICK_BEHAVIOR,
            {
                name: "EffectsPanel.SettingTemporaryEffectsRightClickBehavior",
                hint: "EffectsPanel.SettingTemporaryEffectsRightClickBehaviorHint",
                scope: "client",
                config: true,
                default: RIGHT_CLICK_BEHAVIOR.DIALOG,
                choices: rightClickBehaviors,
                type: String,
                onChange: () => game.dfreds.effectsPanel.refresh(),
            },
        );

        game.settings.register(MODULE_ID, this.#ALLOW_RIGHT_CLICK, {
            name: "EffectsPanel.SettingAllowRightClick",
            hint: "EffectsPanel.SettingAllowRightClickHint",
            scope: "world",
            config: true,
            default: CONST.USER_ROLES.PLAYER,
            choices: userRoles,
            type: String,
            onChange: () => game.dfreds.effectsPanel.refresh(),
        });

        game.settings.register(MODULE_ID, this.#VIEW_PERMISSION, {
            name: "EffectsPanel.SettingViewPermission",
            hint: "EffectsPanel.SettingViewPermissionHint",
            scope: "world",
            config: true,
            default: CONST.USER_ROLES.PLAYER,
            choices: userRoles,
            type: String,
            onChange: () => game.dfreds.effectsPanel.refresh(),
        });

        game.settings.register(MODULE_ID, this.#VIEW_DETAILS_PERMISSION, {
            name: "EffectsPanel.SettingViewDetailsPermission",
            hint: "EffectsPanel.SettingViewDetailsPermissionHint",
            scope: "world",
            config: true,
            default: CONST.USER_ROLES.PLAYER,
            choices: userRoles,
            type: String,
            onChange: () => game.dfreds.effectsPanel.refresh(),
        });
    }

    /**
     * Returns the game setting for the icon size
     *
     * @returns a number representing the icon size
     */
    get iconSize(): number {
        return game.settings.get(MODULE_ID, this.#ICON_SIZE) as number;
    }

    /**
     * Returns the game setting for the passive right-click behavior
     *
     * @returns the string representing the behavior
     */
    get passiveEffectsRightClickBehavior(): string {
        return game.settings.get(
            MODULE_ID,
            this.#PASSIVE_EFFECTS_RIGHT_CLICK_BEHAVIOR,
        ) as string;
    }

    /**
     * Returns the game setting for the temporary right-click behavior
     *
     * @returns the string representing the behavior
     */
    get temporaryEffectsRightClickBehavior(): string {
        return game.settings.get(
            MODULE_ID,
            this.#TEMPORARY_EFFECTS_RIGHT_CLICK_BEHAVIOR,
        ) as string;
    }

    /**
     * Returns the game setting for showing disabled effects
     *
     * @returns true if disabled effects should be shown
     */
    get showDisabledEffects(): boolean {
        return game.settings.get(
            MODULE_ID,
            this.#SHOW_DISABLED_EFFECTS,
        ) as boolean;
    }

    /**
     * Returns the game setting for showing passive effects
     *
     * @returns true if passive effects should be shown
     */
    get showPassiveEffects(): boolean {
        return game.settings.get(
            MODULE_ID,
            this.#SHOW_PASSIVE_EFFECTS,
        ) as boolean;
    }

    /**
     * Returns the game setting for showing duration overlays
     *
     * @returns true if overlays should be shown
     */
    get showDurationOverlays(): boolean {
        return game.settings.get(
            MODULE_ID,
            this.#SHOW_DURATION_OVERLAYS,
        ) as boolean;
    }

    /**
     * Returns the game setting for allowing right-click
     *
     * @returns a number representing the chosen role
     */
    get allowRightClick(): number {
        return parseInt(
            game.settings.get(MODULE_ID, this.#ALLOW_RIGHT_CLICK) as string,
        );
    }

    /**
     * Returns the game setting for view permission
     *
     * @returns a number representing the chosen role
     */
    get viewPermission(): number {
        return parseInt(
            game.settings.get(MODULE_ID, this.#VIEW_PERMISSION) as string,
        );
    }

    /**
     * Returns the game setting for view details permission
     *
     * @returns a number representing the chosen role
     */
    get viewDetailsPermission(): number {
        return parseInt(
            game.settings.get(
                MODULE_ID,
                this.#VIEW_DETAILS_PERMISSION,
            ) as string,
        );
    }
}

export { Settings };
