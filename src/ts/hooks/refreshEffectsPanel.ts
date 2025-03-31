import { Listener } from "./index.ts";

const UpdateWorldTime: Listener = {
    listen: () => {
        Hooks.on("updateWorldTime", () => {
            game.dfreds.effectsPanel.refresh();
        });
    },
};

const CreateActiveEffect: Listener = {
    listen: () => {
        Hooks.on("createActiveEffect", () => {
            game.dfreds.effectsPanel.refresh();
        });
    },
};

const UpdateActiveEffect: Listener = {
    listen: () => {
        Hooks.on("updateActiveEffect", () => {
            game.dfreds.effectsPanel.refresh();
        });
    },
};

const DeleteActiveEffect: Listener = {
    listen: () => {
        Hooks.on("deleteActiveEffect", () => {
            game.dfreds.effectsPanel.refresh();
        });
    },
};

export {
    UpdateWorldTime,
    CreateActiveEffect,
    UpdateActiveEffect,
    DeleteActiveEffect,
};
