import { Listener } from "./index.ts";

const Setup: Listener = {
    listen: () => {
        Hooks.on("setup", () => {
            if (BUILD_MODE === "development") {
                CONFIG.debug.hooks = true;
            }
        });
    },
};

export { Setup };
