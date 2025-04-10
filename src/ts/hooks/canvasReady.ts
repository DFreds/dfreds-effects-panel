import { EffectsPanelApp } from "../app/effects-panel-app.ts";
import { Listener } from "./index.ts";

const CanvasReady: Listener = {
    listen: () => {
        Hooks.on("canvasReady", () => {
            game.dfreds.effectsPanel = new EffectsPanelApp();
            game.dfreds.effectsPanel.render(true);
        });
    },
};

export { CanvasReady };
