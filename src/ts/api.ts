import { id as MODULE_ID } from "@static/module.json";
import { EffectsPanelApp } from "./app/effects-panel-app.ts";

interface ThisModule extends Module {
    api: ThisApi;
}

interface ThisApi {
    get effectsPanel(): EffectsPanelApp;
    set effectsPanel(effectsPanel: EffectsPanelApp);
}

function getThisModule(): Module {
    return game.modules.get(MODULE_ID)!;
}

export { type ThisModule, type ThisApi };
