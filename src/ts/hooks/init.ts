import { HandlebarHelpers } from "../handlebar-helpers.ts";
import { Listener } from "./index.ts";
import { Settings } from "../settings.ts";

const Init: Listener = {
    listen: () => {
        Hooks.once("init", () => {
            new Settings().register();
            new HandlebarHelpers().register();

            game.dfreds = game.dfreds || {};
        });
    },
};

export { Init };
