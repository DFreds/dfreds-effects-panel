import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const CrudActiveEffects: Listener = {
    listen: () => {
        Hooks.on("createActiveEffect", () => {
            getEffectsPanel()?.refresh();
        });
        Hooks.on("updateActiveEffect", () => {
            getEffectsPanel()?.refresh();
        });
        Hooks.on("deleteActiveEffect", () => {
            getEffectsPanel()?.refresh();
        });
    },
};

export { CrudActiveEffects };
