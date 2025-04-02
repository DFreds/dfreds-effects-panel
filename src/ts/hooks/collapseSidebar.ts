import { Listener } from "./index.ts";

const CollapseSidebar: Listener = {
    listen: () => {
        Hooks.on("collapseSidebar", (_sidebar: any, _collapse: any) => {
            game.dfreds.effectsPanel.setFromRightPx(true);
        });
    },
};

export { CollapseSidebar };
