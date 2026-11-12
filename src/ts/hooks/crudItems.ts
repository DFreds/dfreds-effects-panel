import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const CrudItems: Listener = {
    listen: () => {
        for (const action of ["create", "update", "delete"]) {
            // @ts-expect-error The createItem, updateItem, and deleteItem hooks are not typed
            Hooks.on(`${action}Item`, (item: Item) => {
                const effectsPanel = getEffectsPanel();
                if (item.parent && item.parent === effectsPanel?.actor) {
                    effectsPanel.refresh();
                }
            });
        }
    },
};

export { CrudItems };
