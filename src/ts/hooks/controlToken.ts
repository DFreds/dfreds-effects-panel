import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const ControlToken: Listener = {
    listen: () => {
        Hooks.on("controlToken", () => {
            const effectsPanel = getEffectsPanel();
            effectsPanel?.resetCurrentShownEffectInfoId();
            effectsPanel?.exitManageMode();
        });
    },
};

export { ControlToken };
