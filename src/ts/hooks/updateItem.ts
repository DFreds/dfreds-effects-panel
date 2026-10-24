import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const UpdateItem: Listener = {
    listen: () => {
        // @ts-expect-error The updateItem hook is not typed
        Hooks.on("updateItem", (item: Item) => {
            const effectsPanel = getEffectsPanel();
            if (item.parent && item.parent === effectsPanel?.actor) {
                effectsPanel.refresh();
            }
        });
    },
};

export { UpdateItem };
