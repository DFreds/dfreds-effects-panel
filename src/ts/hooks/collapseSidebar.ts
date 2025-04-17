import { Listener } from "./index.ts";
import { getEffectsPanel } from "../utils/gets.ts";

const CollapseSidebar: Listener = {
    listen: () => {
        Hooks.on("collapseSidebar", (_sidebar: any, _collapse: any) => {
            getEffectsPanel()?.setFromRightPx({ animate: true });
        });
    },
};

export { CollapseSidebar };
