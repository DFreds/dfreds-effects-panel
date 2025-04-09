import { Listener } from "./index.ts";
import { Settings } from "../settings.ts";

const Init: Listener = {
    listen: () => {
        Hooks.once("init", () => {
            new Settings().register();

            game.dfreds = game.dfreds || {};
        });
    },
};

export { Init };
