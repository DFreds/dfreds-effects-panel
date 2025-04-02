import { Listener } from "./index.ts";

const RtcSettingsChanged: Listener = {
    listen: () => {
        Hooks.on("rtcSettingsChanged", () => {
            game.dfreds.effectsPanel.setFromRightPx(true);
        });
    },
};

export { RtcSettingsChanged };
