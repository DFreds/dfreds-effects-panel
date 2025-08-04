import { EffectsPanelAppV2 } from "../app/effects-panel-app-v2.ts";
import { MODULE_ID } from "../constants.ts";

function getEffectsPanel(): EffectsPanelAppV2 | undefined {
    return (game.modules.get(MODULE_ID) as EffectsPanelModule).effectsPanel as
        | EffectsPanelAppV2
        | undefined;
}

export { getEffectsPanel };
