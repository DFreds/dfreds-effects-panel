import { EffectsPanelApp } from "../app/effects-panel-app.ts";
import { MODULE_ID } from "../constants.ts";

function getEffectsPanel(): EffectsPanelApp | undefined {
    return (game.modules.get(MODULE_ID) as EffectsPanelModule).effectsPanel as
        | EffectsPanelApp
        | undefined;
}

export { getEffectsPanel };
