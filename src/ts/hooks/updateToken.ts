import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const UpdateToken: Listener = {
    listen: () => {
        // @ts-expect-error The updateToken hook is not typed
        Hooks.on("updateToken", (token: TokenDocument) => {
            const effectsPanel = getEffectsPanel();
            if (token === effectsPanel?.token) {
                effectsPanel.refresh();
            }
        });
    },
};

export { UpdateToken };
