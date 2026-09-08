import { EffectsPanelAppV2 } from "../app/effects-panel-app-v2.ts";
import { MODULE_ID } from "../constants.ts";
import { Listener } from "./index.ts";

const CanvasReady: Listener = {
    listen: () => {
        Hooks.on("canvasReady", () => {
            const module = game.modules.get(MODULE_ID) as EffectsPanelModule;
            module.effectsPanel ??= new EffectsPanelAppV2();

            module.effectsPanel.resetCurrentShownEffectInfoId();
            module.effectsPanel.exitManageMode();

            module.effectsPanel.render(true);
        });
    },
};

export { CanvasReady };
