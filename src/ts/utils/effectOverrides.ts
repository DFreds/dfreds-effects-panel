import { EFFECT_DISPLAY, MODULE_ID, USER_FLAGS } from "../constants.ts";

type EffectDisplay = (typeof EFFECT_DISPLAY)[keyof typeof EFFECT_DISPLAY];

function getEffectOverrides(): Record<string, EffectDisplay> {
    return (game.user.getFlag(MODULE_ID, USER_FLAGS.EFFECT_OVERRIDES) ?? {}) as Record<string, EffectDisplay>;
}

async function setEffectOverride(key: string, display: EffectDisplay): Promise<void> {
    await game.user.setFlag(MODULE_ID, USER_FLAGS.EFFECT_OVERRIDES, {
        [key]: display,
    });
}

async function deleteEffectOverride(key: string): Promise<void> {
    await game.user.unsetFlag(MODULE_ID, `${USER_FLAGS.EFFECT_OVERRIDES}.${key}`);
}

async function clearEffectOverrides(): Promise<void> {
    await game.user.unsetFlag(MODULE_ID, USER_FLAGS.EFFECT_OVERRIDES);
}

export { clearEffectOverrides, deleteEffectOverride, getEffectOverrides, setEffectOverride };
export type { EffectDisplay };
