import moduleData from "@static/module.json" with { type: "json" };

export const MODULE_ID = moduleData.id;

const RIGHT_CLICK_BEHAVIOR = {
    DIALOG: "dialog",
    DELETE: "delete",
    DISABLE: "disable",
};

const EFFECT_DISPLAY = {
    SHOW: "show",
    HIDE: "hide",
};

const USER_FLAGS = {
    TOP_POSITION: "topPosition",
    EFFECT_OVERRIDES: "effectOverrides",
};

export { EFFECT_DISPLAY, RIGHT_CLICK_BEHAVIOR, USER_FLAGS };
