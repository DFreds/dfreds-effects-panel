import { Listener } from "./index.ts";

const CanvasReady: Listener = {
    listen: () => {
        Hooks.on("canvasReady", () => {
            game.dfreds.effectsPanel.render(true);
        });
    },
};

export { CanvasReady };
