import { Listener } from "./index.ts";

const Setup: Listener = {
    listen: () => {
        Hooks.on("setup", () => {
            CONFIG.debug.hooks = BUILD_MODE === "development";
        });
    },
};

export { Setup };
