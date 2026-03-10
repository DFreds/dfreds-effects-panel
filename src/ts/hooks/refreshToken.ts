import { getEffectsPanel } from "../utils/gets.ts";
import { Listener } from "./index.ts";

const RefreshToken: Listener = {
    listen: () => {
        Hooks.on("refreshToken", () => {
            getEffectsPanel()?.refresh();
        });
    },
};

export { RefreshToken };
