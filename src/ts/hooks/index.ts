import { CanvasReady } from "./canvasReady.ts";
import { Init } from "./init.ts";
import { RenderSidebar } from "./renderSidebar.ts";
import { RtcSettingsChanged } from "./rtcSettingsChanged.ts";
import { CollapseSidebar } from "./collapseSidebar.ts";
import {
    CreateActiveEffect,
    DeleteActiveEffect,
    UpdateActiveEffect,
    UpdateWorldTime,
} from "./refreshEffectsPanel.ts";

interface Listener {
    listen(): void;
}

const HooksEffectsPanel: Listener = {
    listen(): void {
        const listeners: Listener[] = [
            Init,
            CanvasReady,
            CollapseSidebar,
            RtcSettingsChanged,
            RenderSidebar,
            UpdateWorldTime,
            CreateActiveEffect,
            UpdateActiveEffect,
            DeleteActiveEffect,
        ];

        for (const listener of listeners) {
            listener.listen();
        }
    },
};

export { HooksEffectsPanel };
export type { Listener };
