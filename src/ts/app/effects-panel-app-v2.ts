// @ts-expect-error Has no types
import Draggable from "draggable";

import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
} from "@client/applications/_types.mjs";
import { Settings } from "../settings.ts";
import { EFFECT_DISPLAY, MODULE_ID, RIGHT_CLICK_BEHAVIOR, USER_FLAGS } from "../constants.ts";
import {
    clearEffectOverrides,
    deleteEffectOverride,
    getEffectOverrideKey,
    getEffectOverrides,
    setEffectOverride,
} from "../utils/effectOverrides.ts";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const { TextEditor } = foundry.applications.ux;

interface ViewData {
    temporaryEffects: EffectData[];
    passiveEffects: EffectData[];
    disabledTemporaryEffects: EffectData[];
    disabledPassiveEffects: EffectData[];
    canViewEffectsPanel: boolean;
    canViewEffectDetails: boolean;
    showDurationOverlays: boolean;
    hasEffects: boolean;
    isManageMode: boolean;
    iconSize: number;
    itemSize: number;
    badgeSize: number;
}

type SceneActor = Actor<TokenDocument<Scene> | null> | null;

interface EffectData extends ActiveEffect<SceneActor | Actor<null> | Item<null>> {
    timeLabel: string;
    infinite: boolean;
    src: string | null;
    parentDescription: string | null;
    isHidden: boolean;
}

class EffectsPanelAppV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    refresh: () => void;

    #settings: Settings;
    #rootView: JQuery<HTMLElement>;
    #draggable: Draggable;

    #currentShownEffectInfoId: string | null = null;
    #isManageMode = false;

    constructor(options?: DeepPartial<ApplicationConfiguration>) {
        super(options);
        this.refresh = foundry.utils.debounce(this.render.bind(this), 100);

        this.#settings = new Settings();
        this.#rootView = $("<div>"); // Init it to something for now
    }

    static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
        id: "effects-panel",
        window: {
            frame: false,
            minimizable: false,
            resizable: false,
            positioned: true,
        },
    };

    static override PARTS = {
        effectsPanel: {
            id: "content",
            template: "modules/dfreds-effects-panel/templates/effects-panel.hbs",
        },
    };

    resetCurrentShownEffectInfoId(): void {
        this.#currentShownEffectInfoId = null;
    }

    exitManageMode(): void {
        if (!this.#isManageMode) return;
        this.#isManageMode = false;
        this.refresh();
    }

    #resolveVisibility(
        effect: ActiveEffect<SceneActor | Actor<null> | Item<null>>,
        overrides: Record<string, string> = getEffectOverrides(),
    ): boolean {
        const override = overrides[getEffectOverrideKey(effect.name)];

        if (override) return override === EFFECT_DISPLAY.SHOW;

        return this.#inheritedVisibility(effect);
    }

    #inheritedVisibility(effect: ActiveEffect<SceneActor | Actor<null> | Item<null>>): boolean {
        if (effect.disabled) return this.#settings.showDisabledEffects;
        if (effect.isTemporary) return true;
        return this.#settings.showPassiveEffects;
    }

    async #toggleEffectVisibility(effect: ActiveEffect<SceneActor | Actor<null> | Item<null>>): Promise<void> {
        const key = getEffectOverrideKey(effect.name);
        const shouldShow = !this.#resolveVisibility(effect);

        if (shouldShow === this.#inheritedVisibility(effect)) {
            await deleteEffectOverride(key);
        } else {
            await setEffectOverride(key, shouldShow ? EFFECT_DISPLAY.SHOW : EFFECT_DISPLAY.HIDE);
        }

        this.refresh();
    }

    protected override async _prepareContext(_options: ApplicationRenderOptions): Promise<object> {
        const temporaryEffects = [];
        const passiveEffects = [];
        const disabledTemporaryEffects = [];
        const disabledPassiveEffects = [];

        const effects = this.#actorEffects;
        const token = this.#token;
        const overrides = getEffectOverrides();

        for (const effect of effects) {
            effect.isHidden = !this.#resolveVisibility(effect, overrides);

            if (effect.isHidden && !this.#isManageMode) continue;

            effect.description = await TextEditor.enrichHTML(
                this.#replaceTokenVariables(game.i18n.localize(effect.description), token),
                { relativeTo: effect },
            );

            if (effect.parent && effect.parent instanceof Item) {
                effect.parentDescription = await TextEditor.enrichHTML(
                    this.#replaceTokenVariables(
                        // @ts-expect-error Item does not have a description property
                        game.i18n.localize(effect.parent.system?.description?.value ?? ""),
                        token,
                    ),
                    { relativeTo: effect.parent },
                );
            }

            if (effect.disabled) {
                if (effect.isTemporary) {
                    disabledTemporaryEffects.push(effect);
                } else {
                    disabledPassiveEffects.push(effect);
                }
            } else {
                if (effect.isTemporary) {
                    temporaryEffects.push(effect);
                } else {
                    passiveEffects.push(effect);
                }
            }
        }

        const iconSize = this.#settings.iconSize;
        const itemSize = iconSize + 8;
        const badgeSize = Math.max(8, Math.round(iconSize * (15 / 42)));

        return {
            temporaryEffects,
            passiveEffects,
            disabledTemporaryEffects,
            disabledPassiveEffects,
            canViewEffectsPanel: game.user.role >= this.#settings.viewPermission,
            canViewEffectDetails: game.user.role >= this.#settings.viewDetailsPermission,
            showDurationOverlays: this.#settings.showDurationOverlays,
            hasEffects: effects.length > 0,
            isManageMode: this.#isManageMode,
            iconSize,
            itemSize,
            badgeSize,
        } as ViewData;
    }

    protected override async _onFirstRender(_context: object, _options: ApplicationRenderOptions): Promise<void> {
        this.#rootView = $(this.element);
    }

    protected override async _onRender(context: object, options: ApplicationRenderOptions): Promise<void> {
        await super._onRender(context, options);

        this.#initClickListeners();

        const leftPosition = this.#getLeftPosition();
        this.#draggable = new Draggable(this.element, {
            limit: {
                x: [leftPosition, leftPosition],
                y: [0, window.outerHeight - 42],
            },
            threshold: 10,
            onDragEnd: (_element: HTMLElement, _x: number, y: number, _event: MouseEvent) => {
                setTimeout(() => {
                    this.#resetZIndex();
                }, 100);
                game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, y);
            },
        });

        this.#draggable.set({
            left: leftPosition,
            top: this.#getTopPosition(),
        });

        this.setPosition({
            left: leftPosition,
            top: this.#getTopPosition(),
        });

        if (this.#currentShownEffectInfoId) {
            const $effectItem = this.#rootView.find(`[data-effect-id="${this.#currentShownEffectInfoId}"]`);
            $effectItem.find(".effect-info").show();
        }
    }

    protected override _preClose(_options: ApplicationClosingOptions): Promise<void> {
        this.#draggable.destroy();
        return Promise.resolve();
    }

    updateLeftPosition(): void {
        if (!this.#draggable) return;
        if (!this.element?.isConnected) return;

        const leftPosition = this.#getLeftPosition();
        this.element.style.left = `${leftPosition}px`;

        // Keep the draggable's horizontal lock in sync with the new position so
        // a subsequent drag does not snap the panel back to its old location.
        this.#draggable.setLimit({
            x: [leftPosition, leftPosition],
            y: [0, window.outerHeight - 42],
        });
    }

    #getLeftPosition(): number {
        const { uiScale } = game.settings.get("core", "uiConfig") as unknown as {
            uiScale: number;
        };

        const panelWidth = $("#effects-panel").width() ?? 42;
        const padding = 18 * uiScale;
        const rightUiLeftEdge = this.#getRightUiLeftEdge();

        return rightUiLeftEdge - padding - panelWidth;
    }

    #getRightUiLeftEdge(): number {
        const edges: number[] = [];

        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
            edges.push(sidebar.getBoundingClientRect().left);
        }

        const isWebrtcRight = ui.webrtc?.element?.classList.contains("right") ?? false;
        if (isWebrtcRight && ui.webrtc?.element) {
            edges.push(ui.webrtc.element.getBoundingClientRect().left);
        }

        if (edges.length === 0) return window.innerWidth;

        return Math.min(...edges);
    }

    #getTopPosition(): number {
        const topPosition = game.user.getFlag(MODULE_ID, USER_FLAGS.TOP_POSITION) as number | undefined;
        if (topPosition === undefined) {
            game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, 12);
        }

        return topPosition ?? 12;
    }

    #resetZIndex(): void {
        this.element.style.zIndex = "30";
    }

    #initClickListeners(): void {
        const icons = this.#rootView.find("div.effect-icon-container");
        icons.on("click", this.#onIconClick.bind(this));
        icons.on("contextmenu", this.#onIconRightClick.bind(this));
        icons.on("dblclick", this.#onIconDoubleClick.bind(this));
        const manageToggle = this.#rootView.find("button.manage-toggle");
        manageToggle.on("click", this.#onManageToggleClick.bind(this));
        manageToggle.on("contextmenu", this.#onManageToggleRightClick.bind(this));
    }

    #onManageToggleClick(): void {
        if (this.#wasDragged) return;

        this.#resetZIndex();

        this.#isManageMode = !this.#isManageMode;

        this.#currentShownEffectInfoId = null;

        this.refresh();
    }

    async #onManageToggleRightClick(event: JQuery.ContextMenuEvent): Promise<void> {
        event.preventDefault();

        this.#resetZIndex();

        const confirmed = await DialogV2.confirm({
            window: {
                title: game.i18n.localize("EffectsPanel.ResetEffectDisplayOverrides"),
                controls: [],
            },
            position: {
                width: 300,
                top: event.clientY,
                left: event.clientX - 300 - 18,
            },
            content: `<p>${game.i18n.localize("EffectsPanel.ResetEffectDisplayOverridesContent")}</p>`,
            rejectClose: false,
        });

        if (!confirmed) return;

        await clearEffectOverrides();
        this.refresh();
    }

    #onIconClick(event: Event): void {
        if (event.currentTarget === null) return;

        this.#resetZIndex();

        if (this.#isManageMode) {
            this.#onManageModeIconClick(event);
            return;
        }

        const $target = $(event.currentTarget);
        const $effectItem = $target.closest(".effect-item");
        const $effectInfo = $effectItem.find(".effect-info");

        const effectId = $effectItem.attr("data-effect-id");

        if ($effectInfo.is(":visible")) {
            $effectInfo.hide();
            this.#currentShownEffectInfoId = null;
        } else {
            this.#rootView.find(".effect-info").hide();
            $effectInfo.show();
            this.#currentShownEffectInfoId = effectId ?? null;
        }
    }

    #onManageModeIconClick(event: Event): void {
        const $effectItem = $(event.currentTarget as HTMLElement).closest(".effect-item");
        const effectId = $effectItem.attr("data-effect-id");

        const effects = this.#getActorEffects(this.#actor);
        const effect = effects.find((e) => e.id === effectId);

        if (!effect) return;

        this.#toggleEffectVisibility(effect);
    }

    async #onIconRightClick(event: JQuery.ContextMenuEvent): Promise<void> {
        if (event.currentTarget === null) return;

        this.#resetZIndex();

        if (this.#isManageMode) return;

        if (game.user.role < this.#settings.allowRightClick) return;

        const $target = $(event.currentTarget);
        const $effectItem = $target.closest(".effect-item");

        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effectId = $effectItem.attr("data-effect-id");

        const effect = effects.find((e) => e.id === effectId);

        if (!effect) return;

        const rightClickBehavior = this.#getRightClickBehavior({
            isTemporary: effect.isTemporary,
            isShift: event.shiftKey,
        });

        await this.#handleEffectChange({
            eventX: event.clientX,
            eventY: event.clientY,
            effect,
            rightClickBehavior,
        });
    }

    #getRightClickBehavior({ isTemporary, isShift }: { isTemporary: boolean; isShift: boolean }): string {
        if (isTemporary && isShift) {
            return this.#settings.temporaryEffectsShiftRightClickBehavior;
        } else if (!isTemporary && isShift) {
            return this.#settings.passiveEffectsShiftRightClickBehavior;
        } else if (isTemporary) {
            return this.#settings.temporaryEffectsRightClickBehavior;
        } else {
            return this.#settings.passiveEffectsRightClickBehavior;
        }
    }

    async #handleEffectChange({
        eventX,
        eventY,
        effect,
        rightClickBehavior,
    }: {
        eventX: number;
        eventY: number;
        effect: ActiveEffect<SceneActor | Actor<null>>;
        rightClickBehavior: string;
    }): Promise<void> {
        if (effect.parent && effect.parent instanceof Item && !this.#settings.allowRightClickingItemEffects) {
            ui.notifications.warn(game.i18n.localize("EffectsPanel.DisablingOrDeletingItemEffectsNotAllowed"));
            return;
        }

        if (rightClickBehavior === RIGHT_CLICK_BEHAVIOR.DIALOG) {
            const content = game.i18n.localize("EffectsPanel.DeleteOrDisableEffectContent", {
                effect: effect.name,
            });

            await DialogV2.wait({
                window: {
                    title: game.i18n.localize("EffectsPanel.DeleteOrDisableEffect"),
                    controls: [],
                },
                position: {
                    width: 300,
                    top: eventY,
                    left: eventX - 300 - 18,
                },
                content: `<p>${content}?</p>`,
                buttons: [
                    {
                        action: "delete",
                        label: game.i18n.localize("EffectsPanel.Delete"),
                        icon: "fa-solid fa-trash",
                        callback: async () => {
                            await effect.delete();
                            this.refresh();
                        },
                    },
                    {
                        action: "disable",
                        label: effect.disabled
                            ? game.i18n.localize("EffectsPanel.Enable")
                            : game.i18n.localize("EffectsPanel.Disable"),
                        icon: effect.disabled ? "fas fa-check" : "fas fa-close",
                        callback: async () => {
                            await effect.update({
                                disabled: !effect.disabled,
                            });
                        },
                    },
                ],
            });
        } else if (rightClickBehavior === RIGHT_CLICK_BEHAVIOR.DELETE) {
            await effect.delete();
            this.refresh();
        } else if (rightClickBehavior === RIGHT_CLICK_BEHAVIOR.DISABLE) {
            await effect.update({ disabled: !effect.disabled });
        }
    }

    #onIconDoubleClick(event: Event): void {
        if (event.currentTarget === null) return;

        if (this.#isManageMode) return;

        const $target = $(event.currentTarget);
        const $effectItem = $target.closest(".effect-item");

        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effectId = $effectItem.attr("data-effect-id");

        const effect = effects.find((effect) => effect.id === effectId);

        if (!effect) return;

        effect.sheet?.render(true);
    }

    get #actorEffects(): EffectData[] {
        const actor = this.#actor;

        if (!actor) return [];

        const effects = this.#getActorEffects(actor);

        return effects
            .map((effect) => {
                const src = this.#getSourceName(effect);
                const effectData = effect.clone({}, { keepId: true }) as EffectData;

                effectData.infinite = effect.duration.value === Infinity;
                effectData.timeLabel = this.#determineTimeLabel(effect);
                effectData.src = src;

                return effectData;
            })
            .sort((a, b) => {
                if (a.isTemporary) return -1;
                if (b.isTemporary) return 1;
                return 0;
            })
            .filter((effectData) => {
                return !effectData.isSuppressed;
            });
    }

    get #actor(): SceneActor | Actor<null> | null {
        const userActor = game.user?.character as Actor<null> | null;
        return canvas.tokens.controlled[0]?.actor ?? userActor ?? null;
    }

    get #token(): TokenDocument | foundry.data.PrototypeToken<Actor> | null {
        const controlledToken = canvas.tokens.controlled[0]?.document;
        if (controlledToken) return controlledToken;

        const actor = this.#actor;
        return actor?.token ?? actor?.prototypeToken ?? null;
    }

    /**
     * Replaces `{{token.<path>}}` placeholders in the given text with the
     * matching property on the base token (e.g. `{{token.name}}`). Any path
     * available on the token document is supported. Unknown paths are left
     * untouched.
     */
    #replaceTokenVariables(text: string, token: TokenDocument | foundry.data.PrototypeToken<Actor> | null): string {
        if (!token || !text) return text;

        return text.replace(/\{\{\s*token\.([\w.-]+)\s*\}\}/g, (match, path: string) => {
            const value = foundry.utils.getProperty(token, path);
            return value !== undefined && value !== null ? String(value) : match;
        });
    }

    #getActorEffects(actor: SceneActor | Actor<null> | null): ActiveEffect<SceneActor | Actor<null>>[] {
        const effects: ActiveEffect<SceneActor | Actor<null>>[] = [];
        for (const effect of actor?.allApplicableEffects() || []) {
            effects.push(effect);
        }
        return effects;
    }

    #getSourceName(effect: ActiveEffect<SceneActor | Actor<null>>): string | null {
        if (!effect.origin) return null;
        try {
            const name = fromUuidSync(effect.origin)?.name;

            if (name === undefined) return null;

            return name;
        } catch {
            return null;
        }
    }

    #determineTimeLabel(effect: ActiveEffect<SceneActor | Actor<null>>): string {
        if (game.system.id === "demonlord") {
            const dlResult = this.#handleDemonLordRemainingTime(effect);
            if (dlResult) return dlResult;
        }

        if (effect.duration.value === Infinity) {
            return game.i18n.localize("EffectsPanel.Unlimited");
        }

        return effect.duration.label ?? `${effect.duration.value} ${effect.duration.units}`;
    }

    #handleDemonLordRemainingTime(effect: ActiveEffect<SceneActor | Actor<null>>): string | null {
        let tokenName;
        const specialDuration = foundry.utils.getProperty(effect, "flags.demonlord.specialDuration") as
            | string
            | undefined;
        if (specialDuration !== "None" && specialDuration !== undefined) {
            tokenName = fromUuidSync(effect.origin?.substring(0, effect.origin.search(".Actor.")) ?? "")?.name;
            switch (specialDuration) {
                case "EndOfTheRound":
                    return game.i18n.localize("EffectsPanel.EndOfTheRound");
                case "NextAttackRoll":
                    return game.i18n.localize("EffectsPanel.NextAttackRoll");
                case "NextChallengeRoll":
                    return game.i18n.localize("EffectsPanel.NextChallengeRoll");
                case "TurnEndSource":
                    return game.i18n.localize("EffectsPanel.TurnEnd") + ` [${tokenName}]`;
                case "TurnStartSource":
                    return game.i18n.localize("EffectsPanel.TurnStart") + ` [${tokenName}]`;
                case "TurnEnd":
                    return game.i18n.localize("EffectsPanel.TurnEnd");
                case "TurnStart":
                    return game.i18n.localize("EffectsPanel.TurnStart");
                case "NextD20Roll":
                    return game.i18n.localize("EffectsPanel.NextD20Roll");
                case "NextDamageRoll":
                    return game.i18n.localize("EffectsPanel.NextDamageRoll");
                case "RestComplete":
                    return game.i18n.localize("EffectsPanel.RestComplete");
                default:
                    return specialDuration;
            }
        }

        return null;
    }
}

export { EffectsPanelAppV2 };
