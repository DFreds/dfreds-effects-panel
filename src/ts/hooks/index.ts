import { CanvasReady } from "./canvasReady.ts";
import { Init } from "./init.ts";
import { RtcSettingsChanged } from "./rtcSettingsChanged.ts";
import { CollapseSidebar } from "./collapseSidebar.ts";
import { Setup } from "./setup.ts";
import { RefreshToken } from "./refreshToken.ts";

interface Listener {
    listen(): void;
}

const HooksEffectsPanel: Listener = {
    listen(): void {
        const listeners: Listener[] = [
            Init,
            Setup,
            CanvasReady,
            CollapseSidebar,
            RtcSettingsChanged,
            RefreshToken,
        ];

        for (const listener of listeners) {
            listener.listen();
        }
    },
};

export { HooksEffectsPanel };
export type { Listener };
