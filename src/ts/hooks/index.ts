import { CanvasReady } from "./canvasReady.ts";
import { ControlToken } from "./controlToken.ts";
import { CrudActiveEffects } from "./crudActiveEffects.ts";
import { Init } from "./init.ts";
import { Ready } from "./ready.ts";
import { RefreshToken } from "./refreshToken.ts";
import { RtcSettingsChanged } from "./rtcSettingsChanged.ts";
import { Setup } from "./setup.ts";
import { UpdateWorldTime } from "./updateWorldTime.ts";

interface Listener {
    listen(): void;
}

const HooksEffectsPanel: Listener = {
    listen(): void {
        const listeners: Listener[] = [
            Init,
            Ready,
            Setup,
            CanvasReady,
            RtcSettingsChanged,
            ControlToken,
            RefreshToken,
            CrudActiveEffects,
            UpdateWorldTime,
        ];

        for (const listener of listeners) {
            listener.listen();
        }
    },
};

export { HooksEffectsPanel };
export type { Listener };
