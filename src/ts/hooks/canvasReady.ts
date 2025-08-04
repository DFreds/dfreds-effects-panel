import { EffectsPanelAppV2 } from "../app/effects-panel-app-v2.ts";
import { MODULE_ID } from "../constants.ts";
import { Listener } from "./index.ts";

const CanvasReady: Listener = {
    listen: () => {
        Hooks.on("canvasReady", () => {
            const effectsPanel = new EffectsPanelAppV2();
            (game.modules.get(MODULE_ID) as EffectsPanelModule).effectsPanel =
                effectsPanel;
            effectsPanel.render(true);
        });
    },
};

export { CanvasReady };
