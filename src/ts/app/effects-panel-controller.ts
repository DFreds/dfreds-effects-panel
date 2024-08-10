import { id as MODULE_ID } from "@static/module.json";
import { EffectDurationData } from "types/foundry/common/documents/active-effect.js";
import { Settings } from "../settings.ts";
import { EffectsPanelApp } from "./effects-panel-app.ts";
import { RIGHT_CLICK_BEHAVIOR, USER_FLAGS } from "../constants.ts";

interface ViewData {
    temporaryEffects: EffectData[];
    passiveEffects: EffectData[];
    disabledTemporaryEffects: EffectData[];
    disabledPassiveEffects: EffectData[];
    topStyle: string;
}

// TODO consider cleaning this up to grab most from ActiveEffect
interface EffectData extends ActiveEffect<SceneActor | Actor<null>> {
    remainingSeconds: number;
    turns: number | null;
    isExpired: boolean;
    infinite: boolean;
    isSupp: boolean;
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

                effectData.remainingSeconds = this.#getSecondsRemaining(
                    effectData.duration,
                );
                effectData.turns = effectData.duration.turns;
                effectData.isExpired = effectData.remainingSeconds <= 0;
                effectData.infinite = effectData.remainingSeconds === Infinity;
                effectData.description = this.#getDescription(effect);

                effectData.isSupp = effect.isSuppressed;
                effectData.src = src;

                return effectData;
            })
            .sort((a, b) => {
                if (a.isTemporary) return -1;
                if (b.isTemporary) return 1;
                return 0;
            })
            .filter((effectData) => {
                return !effectData.isSupp;
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

    #getDescription(effect: ActiveEffect<SceneActor | Actor<null>>): string {
        const effectDescription = effect.description;

        const hasConvenientEffects = game.modules.get(MODULE_ID)?.active;
        const flagDescription = hasConvenientEffects
            ? (effect.getFlag(MODULE_ID, "description") as string)
            : "";
        const legacyDescription = (effect.flags as any)
            .convenientDescription as string;

        return effectDescription || flagDescription || legacyDescription;
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

    async onIconRightClick(event: Event): Promise<void> {
        if (event.currentTarget === null) return;

        const $target = $(event.currentTarget);
        const actor = this.#actor;
        const effects = this.#getActorEffects(actor);
        const effect = effects.find(
            (e) => e.id === $target.attr("data-effect-id"),
        );

        if (!effect) return;

        if (effect.isTemporary) {
            await this.#handleEffectChange(
                effect,
                this.#settings.temporaryEffectsRightClickBehavior,
            );
        } else {
            await this.#handleEffectChange(
                effect,
                this.#settings.passiveEffectsRightClickBehavior,
            );
        }
    }

    async #handleEffectChange(
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
            await Dialog.wait({
                title: game.i18n.localize("EffectsPanel.DeleteOrDisableEffect"),
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
                            await effect.update({ disabled: !effect.disabled });
                        },
                    },
                },
            });
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

    #getSecondsRemaining(duration: EffectDurationData): number {
        if (duration.seconds) {
            return (
                (duration.startTime || 0) +
                duration.seconds -
                game.time.worldTime
            );
        } else if (duration.rounds) {
            return (
                (duration.rounds - (duration.startRound || 0)) *
                CONFIG.time.roundTime
            );
        } else {
            return Infinity;
        }
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
            topPosition = 5;
            game.user.setFlag(MODULE_ID, USER_FLAGS.TOP_POSITION, topPosition);
        }

        return `top: ${topPosition}px;`;
    }
}

type SceneActor = Actor<TokenDocument<Scene> | null> | null;

export { EffectsPanelController };
