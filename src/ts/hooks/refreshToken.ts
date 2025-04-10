import { Listener } from "./index.ts";

const RefreshToken: Listener = {
    listen: () => {
        Hooks.on("refreshToken", () => {
            game.dfreds.effectsPanel.refresh();
        });
    },
};

export { RefreshToken };
