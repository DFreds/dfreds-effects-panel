import { Listener } from "./index.ts";

const RtcSettingsChanged: Listener = {
    listen: () => {
        Hooks.on("rtcSettingsChanged", () => {
            game.dfreds.effectsPanel.setFromRightPx({ animate: true });
        });
    },
};

export { RtcSettingsChanged };
