import { uiResize } from "../utils/uiResize.ts";
import { Listener } from "./index.ts";

const Ready: Listener = {
    listen: () => {
        Hooks.once("ready", () => {
            uiResize();
        });
    },
};

export { Ready };
