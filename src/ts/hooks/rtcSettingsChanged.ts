import { Listener } from "./index.ts";
import { getEffectsPanel } from "../utils/gets.ts";

const RtcSettingsChanged: Listener = {
    listen: () => {
        Hooks.on("rtcSettingsChanged", () => {
            getEffectsPanel()?.animateFromLeftPx();
        });
    },
};

export { RtcSettingsChanged };
