import { CanvasReady } from "./canvasReady.ts";
import { Init } from "./init.ts";
import { RtcSettingsChanged } from "./rtcSettingsChanged.ts";
import { CollapseSidebar } from "./collapseSidebar.ts";
import { Setup } from "./setup.ts";
import { ControlToken } from "./controlToken.ts";
import { CrudActiveEffects } from "./crudActiveEffects.ts";

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
            ControlToken,
            CrudActiveEffects,
        ];

        for (const listener of listeners) {
            listener.listen();
        }
    },
};

export { HooksEffectsPanel };
export type { Listener };
