import "../styles/style.scss"; // Keep or else vite will not include this
import { EffectsPanelApp } from "./app/effects-panel-app.ts";
import { HandlebarHelpers } from "./handlebar-helpers.ts";
import { libWrapper } from "@static/lib/shim.ts";
import { Settings } from "./settings.ts";
import { MODULE_ID } from "./constants.ts";

/**
 * Initializes the handlebar helpers
 */
Hooks.once("init", () => {
    new Settings().registerSettings();
    new HandlebarHelpers().registerHelpers();

    game.dfreds = game.dfreds || {};
});

/**
 * Handle setting up the app and lib wrapper overrides
 */
Hooks.once("renderSidebar", () => {
    game.dfreds.effectsPanel = new EffectsPanelApp();

    libWrapper.register(
        MODULE_ID,
        "Token.prototype._onControl",
        function (this: Token, wrapper: AnyFunction, ...args: any) {
            if (game.ready) game.dfreds.effectsPanel.refresh();
            wrapper(...args);
        },
        "WRAPPER",
    );
    libWrapper.register(
        MODULE_ID,
        "Token.prototype._onRelease",
        function (this: Token, wrapper: AnyFunction, ...args: any) {
            game.dfreds.effectsPanel.refresh();
            wrapper(...args);
        },
        "WRAPPER",
    );
    libWrapper.register(
        MODULE_ID,
        "TokenDocument.prototype._onUpdate",
        function (this: TokenDocument, wrapper: AnyFunction, ...args: any) {
            wrapper(...args);
            game.dfreds.effectsPanel.refresh();
        },
        "WRAPPER",
    );
    libWrapper.register(
        MODULE_ID,
        "Actor.prototype.prepareData",
        function (this: Actor, wrapper: AnyFunction, ...args: any) {
            wrapper(...args);
            if (canvas.ready && game.user.character === this) {
                game.dfreds.effectsPanel.refresh();
            }
        },
        "WRAPPER",
    );
    libWrapper.register(
        MODULE_ID,
        "User.prototype.prepareData",
        function (this: User, wrapper: AnyFunction, ...args: any) {
            wrapper(...args);
            if (canvas.ready && canvas.tokens.controlled.length > 0) {
                game.dfreds.effectsPanel.refresh();
            }
        },
        "WRAPPER",
    );
});

Hooks.on("collapseSidebar", () => {
    game.dfreds.effectsPanel.updateFromRightPx();
});

Hooks.on("rtcSettingsChanged", () => {
    game.dfreds.effectsPanel.updateFromRightPx();
});

/**
 * Handle rendering the effects panel when the canvas is ready
 */
Hooks.on("canvasReady", () => {
    game.dfreds.effectsPanel.render(true);
});

/**
 * Handle refreshing the effects panel whenever the time updates
 */
Hooks.on("updateWorldTime", (_total, _diff) => {
    game.dfreds.effectsPanel.refresh();
});

/**
 * Handle refreshing the effects panel whenever an effect is added
 */
Hooks.on("createActiveEffect", (_activeEffect, _config, _userId) => {
    game.dfreds.effectsPanel.refresh();
});

/**
 * Handle refreshing the effects panel whenever an effect is updated
 */
Hooks.on("updateActiveEffect", (_activeEffect, _config, _userId) => {
    game.dfreds.effectsPanel.refresh();
});

/**
 * Handle refreshing the effects panel whenever an effect is deleted
 */
Hooks.on("deleteActiveEffect", (_activeEffect, _config, _userId) => {
    game.dfreds.effectsPanel.refresh();
});
