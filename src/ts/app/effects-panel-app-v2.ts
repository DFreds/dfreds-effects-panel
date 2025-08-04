// @ts-expect-error Has no types
import Draggable from "draggable";

import {
    ApplicationClosingOptions,
    ApplicationConfiguration,
    ApplicationRenderOptions,
} from "@client/applications/_types.mjs";
import { Settings } from "../settings.ts";
import {
    MODULE_ID,
    RIGHT_CLICK_BEHAVIOR,
    SECONDS,
    USER_FLAGS,
} from "../constants.ts";
import { EffectDurationData } from "@common/documents/active-effect.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } =
    foundry.applications.api;
const { TextEditor } = foundry.applications.ux;

interface ViewData {
    temporaryEffects: EffectData[];
    passiveEffects: EffectData[];
    disabledTemporaryEffects: EffectData[];
    disabledPassiveEffects: EffectData[];
    canViewEffectsPanel: boolean;
    canViewEffectDetails: boolean;
    showDurationOverlays: boolean;
    iconSize: number;
    itemSize: number;
}

type SceneActor = Actor<TokenDocument<Scene> | null> | null;

interface EffectData extends ActiveEffect<SceneActor | Actor<null>> {
    timeLabel: string;
    isExpired: boolean;
    infinite: boolean;
    src: string | null;
}

class EffectsPanelAppV2 extends HandlebarsApplicationMixin(ApplicationV2) {
    refresh: () => void;

    #settings: Settings;
    #rootView: JQuery<HTMLElement>;
    #draggable: Draggable;

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
            template:
                "modules/dfreds-effects-panel/templates/effects-panel.hbs",
        },
    };

    protected override async _prepareContext(
        _options: ApplicationRenderOptions,
    ): Promise<object> {
        const temporaryEffects = [];
        const passiveEffects = [];
        const disabledTemporaryEffects = [];
        const disabledPassiveEffects = [];

        const effects = this.#actorEffects;

        for (const effect of effects) {
            effect.description = await TextEditor.enrichHTML(
                effect.description,
            );
            if (effect.disabled && this.#settings.showDisabledEffects) {
                if (effect.isTemporary) {
                    disabledTemporaryEffects.push(effect);
                } else {
                    disabledPassiveEffects.push(effect);
                }
            }

            if (!effect.disabled) {
                if (effect.isTemporary) {
                    temporaryEffects.push(effect);
                } else if (this.#settings.showPassiveEffects) {
                    passiveEffects.push(effect);
                }
            }
        }

        return {
            temporaryEffects,
            passiveEffects,
            disabledTemporaryEffects,
            disabledPassiveEffects,
            canViewEffectsPanel:
                game.user.role >= this.#settings.viewPermission,
            canViewEffectDetails:
                game.user.role >= this.#settings.viewDetailsPermission,
            showDurationOverlays: this.#settings.showDurationOverlays,
            iconSize: this.#settings.iconSize,
            itemSize: this.#settings.iconSize + 8,
        } as ViewData;
    }

    protected override _onFirstRender(
        _context: object,
        _options: ApplicationRenderOptions,
    ): void {
        this.#rootView = $(this.element);
    }

    protected override async _onRender(
        context: object,
        options: ApplicationRenderOptions,
    ): Promise<void> {
        await super._onRender(context, options);

        this.#initClickListeners();

        const leftPosition = this.#getLeftPosition();
        this.#draggable = new Draggable(this.element, {
            handle: "#effects-panel-drag-handler",
            limit: {
                x: [leftPosition, leftPosition],
                y: [0, window.outerHeight - 42],
            },
            onDragEnd: (
                _element: HTMLElement,
                _x: number,
                y: number,
                _event: MouseEvent,
            ) => {
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
    }

    protected override _preClose(
        _options: ApplicationClosingOptions,
    ): Promise<void> {
        this.#draggable.destroy();
        return Promise.resolve();
    }

    setFromLeftPx({ animate }: { animate?: boolean }): void {
        const leftPosition = this.#getLeftPosition();

        if (animate) {
            this.#rootView.animate({ left: leftPosition }, { duration: 200 });
        } else {
            this.#rootView.css("left", `${leftPosition}px`);
        }
    }

    #getLeftPosition(): number {
        const isSidebarExpanded = document
            .getElementById("sidebar-content")
            ?.classList.contains("expanded");
        const isWebrtcRight =
            ui.webrtc?.element?.classList.contains("right") ?? false;

        const padding = 18;
        const sidebarWidth = isSidebarExpanded ? 348 : 48;
        const webrtcWidth = isWebrtcRight ? 300 : 0;
        const { uiScale } = game.settings.get(
            "core",
            "uiConfig",
        ) as unknown as {
            uiScale: number;
        };

        const rightPosition = (padding + sidebarWidth + webrtcWidth) * uiScale;

        const panelWidth = 42;
        const leftPosition = window.outerWidth - rightPosition - panelWidth;

        return leftPosition;
    }

    #getTopPosition(): number {
        const topPosition = game.user.getFlag(
            MODULE_ID,
            USER_FLAGS.TOP_POSITION,
        ) as number | undefined;
        if (topPosition === undefined) {
            game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, 12);
        }

        return topPosition ?? 12;
    }

    #initClickListeners(): void {
        const icons = this.#rootView.find("div[data-effect-id]");
        icons.on("click", this.#onIconClick.bind(this));
        icons.on("contextmenu", this.#onIconRightClick.bind(this));
        icons.on("dblclick", this.#onIconDoubleClick.bind(this));
    }

    #onIconClick(event: Event): void {
        if (event.currentTarget === null) return;

        const $target = $(event.currentTarget);
        const $effectItem = $target.closest('.effect-item');
        const $effectInfo = $effectItem.find('.effect-info');

        if ($effectInfo.is(':visible')) {
            $effectInfo.hide();
        } else {
            this.#rootView.find('.effect-info').hide();
            $effectInfo.show();
        }
    }

    async #onIconRightClick(event: JQuery.ContextMenuEvent): Promise<void> {
        if (event.currentTarget === null) return;

        if (game.user.role < this.#settings.allowRightClick) return;

        const $target = $(event.currentTarget);
        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effect = effects.find(
            (e) => e.id === $target.attr("data-effect-id"),
        );

        if (!effect) return;

        if (effect.isTemporary) {
            await this.#handleEffectChange(
                event.clientX,
                event.clientY,
                effect,
                this.#settings.temporaryEffectsRightClickBehavior,
            );
        } else {
            await this.#handleEffectChange(
                event.clientX,
                event.clientY,
                effect,
                this.#settings.passiveEffectsRightClickBehavior,
            );
        }
    }

    async #handleEffectChange(
        eventX: number,
        eventY: number,
        effect: ActiveEffect<SceneActor | Actor<null>>,
        rightClickBehavior: string,
    ): Promise<void> {
        if (rightClickBehavior === RIGHT_CLICK_BEHAVIOR.DIALOG) {
            const content = game.i18n.format(
                "EffectsPanel.DeleteOrDisableEffectContent",
                {
                    effect: effect.name,
                },
            );

            await DialogV2.wait({
                window: {
                    title: game.i18n.localize(
                        "EffectsPanel.DeleteOrDisableEffect",
                    ),
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

        const $target = $(event.currentTarget);
        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effect = effects.find(
            (effect) => effect.id === $target.attr("data-effect-id"),
        );

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
                const effectData = effect.clone(
                    {},
                    { keepId: true },
                ) as EffectData;

                effectData.infinite = effect.type === "none";
                effectData.timeLabel = this.#determineTimeLabel(effect);
                effectData.isExpired = this.#determineIfIsExpired(effect);

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

    #getActorEffects(
        actor: SceneActor | Actor<null> | null,
    ): ActiveEffect<SceneActor | Actor<null>>[] {
        const effects: ActiveEffect<SceneActor | Actor<null>>[] = [];
        for (const effect of actor?.allApplicableEffects() || []) {
            effects.push(effect);
        }
        return effects;
    }

    #getSourceName(
        effect: ActiveEffect<SceneActor | Actor<null>>,
    ): string | null {
        if (!effect.origin) return null;
        try {
            const name = fromUuidSync(effect.origin)?.name;

            if (name === undefined) return null;

            return name;
        } catch {
            return null;
        }
    }

    #determineIfIsExpired(
        effect: ActiveEffect<SceneActor | Actor<null>>,
    ): boolean {
        const durationType = effect.duration.type;

        if (durationType === "seconds") {
            const remainingSeconds =
                this.#getSecondsRemaining(effect.duration) ?? 0;
            return remainingSeconds <= 0;
        } else if (durationType === "turns") {
            const remainingRounds =
                this.#getRoundsRemaining(effect.duration) ?? 0;
            const remainingTurns =
                this.#getTurnsRemaining(effect.duration) ?? 0;
            return (
                remainingRounds < 0 ||
                (remainingRounds === 0 && remainingTurns <= 0)
            );
        }

        return false;
    }

    #determineTimeLabel(
        effect: ActiveEffect<SceneActor | Actor<null>>,
    ): string {
        const durationType = effect.duration.type;

        if (game.system.id === "demonlord") {
            const dlResult = this.#handleDemonLordRemainingTime(effect);
            if (dlResult) return dlResult;
        }

        if (durationType === "seconds") {
            const remainingSeconds =
                this.#getSecondsRemaining(effect.duration) ?? 0;
            if (remainingSeconds <= 0) {
                return game.i18n.localize("EffectsPanel.Expired");
            } else if (remainingSeconds >= SECONDS.IN_TWO_YEARS) {
                return game.i18n.format("EffectsPanel.ManyYears", {
                    years: Math.floor(remainingSeconds / SECONDS.IN_ONE_YEAR),
                });
            } else if (remainingSeconds >= SECONDS.IN_ONE_YEAR) {
                return game.i18n.localize("EffectsPanel.OneYear");
            } else if (remainingSeconds >= SECONDS.IN_TWO_WEEKS) {
                return game.i18n.format("EffectsPanel.ManyWeeks", {
                    weeks: Math.floor(remainingSeconds / SECONDS.IN_ONE_WEEK),
                });
            } else if (remainingSeconds > SECONDS.IN_ONE_WEEK) {
                return game.i18n.localize("EffectsPanel.OneWeek");
            } else if (remainingSeconds >= SECONDS.IN_TWO_DAYS) {
                return game.i18n.format("EffectsPanel.ManyDays", {
                    days: Math.floor(remainingSeconds / SECONDS.IN_ONE_DAY),
                });
            } else if (remainingSeconds > SECONDS.IN_TWO_HOURS) {
                return game.i18n.format("EffectsPanel.ManyHours", {
                    hours: Math.floor(remainingSeconds / SECONDS.IN_ONE_HOUR),
                });
            } else if (remainingSeconds > SECONDS.IN_TWO_MINUTES) {
                return game.i18n.format("EffectsPanel.ManyMinutes", {
                    minutes: Math.floor(
                        remainingSeconds / SECONDS.IN_ONE_MINUTE,
                    ),
                });
            } else if (remainingSeconds >= 2) {
                return game.i18n.format("EffectsPanel.ManySeconds", {
                    seconds: remainingSeconds,
                });
            } else if (remainingSeconds === 1) {
                return game.i18n.localize("EffectsPanel.OneSecond");
            }
        } else if (durationType === "turns") {
            const remainingRounds =
                this.#getRoundsRemaining(effect.duration) ?? 0;
            const remainingTurns =
                this.#getTurnsRemaining(effect.duration) ?? 0;

            if (
                remainingRounds < 0 ||
                (remainingRounds === 0 && remainingTurns <= 0)
            ) {
                return game.i18n.localize("EffectsPanel.Expired");
            } else if (remainingRounds > 0) {
                return game.i18n.format(
                    remainingRounds === 1
                        ? "EffectsPanel.OneRound"
                        : "EffectsPanel.ManyRounds",
                    { rounds: remainingRounds },
                );
            } else if (remainingTurns > 0) {
                return game.i18n.format(
                    remainingTurns === 1
                        ? "EffectsPanel.OneTurn"
                        : "EffectsPanel.ManyTurns",
                    { turns: remainingTurns },
                );
            }
        } else if (durationType === "none") {
            return game.i18n.localize("EffectsPanel.Unlimited");
        }

        return "";
    }

    #handleDemonLordRemainingTime(
        effect: ActiveEffect<SceneActor | Actor<null>>,
    ): string | null {
        let tokenName;
        const specialDuration = foundry.utils.getProperty(
            effect,
            "flags.specialDuration",
        ) as string | undefined;
        if (specialDuration !== "None" && specialDuration !== undefined) {
            tokenName = fromUuidSync(
                effect.origin?.substr(0, effect.origin.search(".Actor.")) ?? "",
            )?.name;
            switch (specialDuration) {
                case "TurnEndSource":
                    return (
                        game.i18n.localize("EffectsPanel.TurnEnd") +
                        ` [${tokenName}]`
                    );
                case "TurnStartSource":
                    return (
                        game.i18n.localize("EffectsPanel.TurnStart") +
                        ` [${tokenName}]`
                    );
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

    #getSecondsRemaining(duration: EffectDurationData): number | null {
        if (duration.seconds === null) return null;

        const currentTime = game.time.worldTime;
        const endTime = (duration.startTime || 0) + duration.seconds;

        return endTime - currentTime;
    }

    #getRoundsRemaining(duration: EffectDurationData): number | null {
        if (duration.rounds === null) return null;

        const currentRound = game.combat?.round ?? 0;
        const endingRound = (duration.startRound || 0) + duration.rounds;

        return endingRound - currentRound;
    }

    #getTurnsRemaining(duration: EffectDurationData): number | null {
        if (duration.turns === null) return null;

        const currentTurn = game.combat?.turn ?? 0;
        const endingTurn = (duration.startTurn || 0) + duration.turns;

        return endingTurn - currentTurn;
    }
}

export { EffectsPanelAppV2 };
