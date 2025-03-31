import { Listener } from "./index.ts";

const CollapseSidebar: Listener = {
    listen: () => {
        Hooks.on("collapseSidebar", () => {
            game.dfreds.effectsPanel.updateFromRightPx();
        });
    },
};

export { CollapseSidebar };
