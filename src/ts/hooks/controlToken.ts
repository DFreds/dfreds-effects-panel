import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const ControlToken: Listener = {
    listen: () => {
        Hooks.on("controlToken", () => {
            getEffectsPanel()?.refresh();
        });
    },
};

export { ControlToken };
