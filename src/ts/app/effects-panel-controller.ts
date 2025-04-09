import { EffectDurationData } from "types/foundry/common/documents/active-effect.js";
import { Settings } from "../settings.ts";
import { EffectsPanelApp } from "./effects-panel-app.ts";
import {
    MODULE_ID,
    RIGHT_CLICK_BEHAVIOR,
    SECONDS,
    USER_FLAGS,
} from "../constants.ts";

interface ViewData {
    temporaryEffects: EffectData[];
    passiveEffects: EffectData[];
    disabledTemporaryEffects: EffectData[];
    disabledPassiveEffects: EffectData[];
    topStyle: string;
    canViewEffectsPanel: boolean;
    canViewEffectDetails: boolean;
    showDurationOverlays: boolean;
    iconSize: number;
    itemSize: number;
}

// TODO consider cleaning this up to grab most from ActiveEffect
interface EffectData extends ActiveEffect<SceneActor | Actor<null>> {
    timeLabel: string;
    isExpired: boolean;
    infinite: boolean;
    src: string | null;
}

class EffectsPanelController {
    #viewMvc: EffectsPanelApp;
    #settings: Settings;

    constructor(viewMvc: EffectsPanelApp) {
        this.#viewMvc = viewMvc;
        this.#settings = new Settings();
    }

    async getData(): Promise<ViewData> {
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
            topStyle: this.#getTopStyle(),
            canViewEffectsPanel:
                game.user.role >= this.#settings.viewPermission,
            canViewEffectDetails:
                game.user.role >= this.#settings.viewDetailsPermission,
            showDurationOverlays: this.#settings.showDurationOverlays,
            iconSize: this.#settings.iconSize,
            itemSize: this.#settings.iconSize + 8,
        };
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

    async onIconRightClick(event: JQuery.ContextMenuEvent): Promise<void> {
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
            await Dialog.wait(
                {
                    title: game.i18n.localize(
                        "EffectsPanel.DeleteOrDisableEffect",
                    ),
                    content: `<h4>${content}?</h4>`,
                    buttons: {
                        delete: {
                            icon: '<i class="fas fa-trash"></i>',
                            label: game.i18n.localize("EffectsPanel.Delete"),
                            callback: async () => {
                                await effect.delete();
                                this.#viewMvc.refresh();
                            },
                        },
                        disable: {
                            icon: effect.disabled
                                ? '<i class="fas fa-check"></i>'
                                : '<i class="fas fa-close"></i>',
                            label: effect.disabled
                                ? game.i18n.localize("EffectsPanel.Enable")
                                : game.i18n.localize("EffectsPanel.Disable"),
                            callback: async () => {
                                await effect.update({
                                    disabled: !effect.disabled,
                                });
                            },
                        },
                    },
                },
                {
                    width: 300,
                    top: eventY,
                    left: eventX - 300 - 18,
                },
            );
        } else if (rightClickBehavior === RIGHT_CLICK_BEHAVIOR.DELETE) {
            await effect.delete();
            this.#viewMvc.refresh();
        } else if (rightClickBehavior === RIGHT_CLICK_BEHAVIOR.DISABLE) {
            await effect.update({ disabled: !effect.disabled });
        }
    }

    onIconDoubleClick(event: Event): void {
        if (event.currentTarget === null) return;

        const $target = $(event.currentTarget);
        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effect = effects.find(
            (effect) => effect.id === $target.attr("data-effect-id"),
        );

        if (!effect) return;

        effect.sheet.render(true);
    }

    get #actor(): SceneActor | Actor<null> | null {
        return (
            canvas.tokens.controlled[0]?.actor ?? game.user?.character ?? null
        );
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

    onMouseDown(event: Event): void {
        event.preventDefault();
        let isRightMB = false;
        if ("which" in event) {
            // Gecko (Firefox), Webkit(Safari/Chrome) & Opera
            isRightMB = event.which === 3;
        } else if ("button" in event) {
            // IE, Opera
            isRightMB = event.button === 2;
        }

        if (isRightMB) return;

        // TODO extract view logic
        const effectsPanel = document.getElementById("effects-panel");
        if (effectsPanel !== null) {
            dragElement(effectsPanel);
        }

        // TODO put in private functions?
        function dragElement(element: HTMLElement) {
            let newYPosition = 0,
                mouseYPosition = 0;
            let timer: NodeJS.Timeout;

            element.onmousedown = dragMouseDown;

            function dragMouseDown(event: MouseEvent) {
                event = event || window.event;
                event.preventDefault();
                // get the mouse cursor position at startup
                mouseYPosition = event.clientY;

                document.onmouseup = closeDragElement;

                // call a function whenever the cursor moves
                timer = setTimeout(() => {
                    document.onmousemove = elementDrag;
                }, 200);
            }

            function elementDrag(event: MouseEvent) {
                event.preventDefault();
                // calculate the new cursor position:
                newYPosition = mouseYPosition - event.clientY;
                mouseYPosition = event.clientY;
                // set the element's new position:
                element.style.top = element.offsetTop - newYPosition + "px";
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                element.onmousedown = null;
                document.onmouseup = null;
                document.onmousemove = null;
                clearTimeout(timer);

                const topPosition = element.offsetTop - newYPosition;
                element.style.top = topPosition + "px";

                game.user.setFlag(
                    MODULE_ID,
                    USER_FLAGS.TOP_POSITION,
                    topPosition,
                );
            }
        }
    }

    #getTopStyle(): string {
        let topPosition = game.user.getFlag(MODULE_ID, USER_FLAGS.TOP_POSITION);
        if (topPosition === undefined) {
            topPosition = 12;
            game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, topPosition);
        }

        return `top: ${topPosition}px;`;
    }
}

type SceneActor = Actor<TokenDocument<Scene> | null> | null;

export { EffectsPanelController };
