import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const UpdateCombat: Listener = {
    listen: () => {
        Hooks.on("updateCombat", (_combat, changes) => {
            if (!("round" in changes) && !("turn" in changes)) return;
            getEffectsPanel()?.refresh();
        });
    },
};

export { UpdateCombat };
