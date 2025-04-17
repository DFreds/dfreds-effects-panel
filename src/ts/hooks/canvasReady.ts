import { EffectsPanelApp } from "../app/effects-panel-app.ts";
import { Listener } from "./index.ts";
import { MODULE_ID } from "../constants.ts";

const CanvasReady: Listener = {
    listen: () => {
        Hooks.on("canvasReady", () => {
            const effectsPanel = new EffectsPanelApp();
            (game.modules.get(MODULE_ID) as EffectsPanelModule).effectsPanel =
                effectsPanel;
            effectsPanel.render(true);
        });
    },
};

export { CanvasReady };
