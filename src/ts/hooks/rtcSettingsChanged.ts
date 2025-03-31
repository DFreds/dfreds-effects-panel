import { Listener } from "./index.ts";

const RtcSettingsChanged: Listener = {
    listen: () => {
        Hooks.on("rtcSettingsChanged", () => {
            game.dfreds.effectsPanel.updateFromRightPx();
        });
    },
};

export { RtcSettingsChanged };
