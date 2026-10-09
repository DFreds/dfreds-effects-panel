import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const CrudActiveEffects: Listener = {
    listen: () => {
        for (const action of ["create", "update", "delete"]) {
            Hooks.on(`${action}ActiveEffect`, () => {
                getEffectsPanel()?.refresh();
            });
        }
    },
};

export { CrudActiveEffects };
