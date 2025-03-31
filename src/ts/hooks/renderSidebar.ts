import { libWrapper } from "@static/lib/shim.ts";
import { Listener } from "./index.ts";
import { MODULE_ID } from "../constants.ts";
import { EffectsPanelApp } from "../app/effects-panel-app.ts";

const RenderSidebar: Listener = {
    listen: () => {
        Hooks.on("renderSidebar", () => {
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
                function (
                    this: TokenDocument,
                    wrapper: AnyFunction,
                    ...args: any
                ) {
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
    },
};

export { RenderSidebar };
