import Constants from '../constants.js';
import Settings from '../settings.js';

export default class EffectsPanelController {
  /**
   * Initializes the controller and its dependencies
   *
   * @param {EffectsPanelController} viewMvc - the app that the controller can interact with
   */
  constructor(viewMvc) {
    this._viewMvc = viewMvc;
    this._settings = new Settings();
  }

  async getEffectData() {
    const temporaryEffects = [];
    const passiveEffects = [];
    const disabledTemporaryEffects = [];
    const disabledPassiveEffects = [];

    const effects = this._actorEffects;

    for (const effect of effects) {
      effect.description = await TextEditor.enrichHTML(effect.description, {
        async: true,
      });
      if (effect.disabled && this._settings.showDisabledEffects) {
        if (effect.isTemporary) {
          disabledTemporaryEffects.push(effect);
        } else {
          disabledPassiveEffects.push(effect);
        }
      }

      if (!effect.disabled) {
        if (effect.isTemporary) {
          temporaryEffects.push(effect);
        } else if (this._settings.showPassiveEffects) {
          passiveEffects.push(effect);
        }
      }
    }

    return {
      temporaryEffects,
      passiveEffects,
      disabledTemporaryEffects,
      disabledPassiveEffects,
      topStyle: this._getTopStyle(),
    };
  }

  get _actorEffects() {
    const actor = this._actor;

    if (!actor) return [];

    const effects = this._getActorEffects(actor);

    return effects
      .map((effect) => {
        const src = this._getSourceName(effect);
        const effectData = effect.clone({}, { keepId: true });

        effectData.remainingSeconds = this._getSecondsRemaining(
          effectData.duration
        );
        effectData.turns = effectData.duration.turns;
        effectData.isExpired = effectData.remainingSeconds <= 0;
        effectData.infinite = effectData.remainingSeconds === Infinity;
        effectData.description = this._getDescription(effect);

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

  _getActorEffects(actor) {
    const effects = [];
    for (const effect of actor.allApplicableEffects()) {
      effects.push(effect);
    }
    return effects;
  }

  _getDescription(effect) {
    const effectDescription = effect.description;

    const hasConvenientEffects = game.modules.get(
      Constants.CE_MODULE_ID
    )?.active;
    const flagDescription = hasConvenientEffects
      ? effect.getFlag(Constants.CE_MODULE_ID, 'description')
      : '';
    const legacyDescription = effect.flags.convenientDescription;

    return effectDescription || flagDescription || legacyDescription;
  }

  _getSourceName(effect) {
    if (!effect.origin) return false;
    try {
      return fromUuidSync(effect.origin).name;
    } catch {
      return false;
    }
  }

  async onIconRightClick(event) {
    const $target = $(event.currentTarget);
    const actor = this._actor;
    const effects = this._getActorEffects(actor);
    const effect = effects.find((e) => e.id === $target.attr('data-effect-id'));

    if (!effect) return;

    if (effect.isTemporary) {
      await this._handleEffectChange(
        effect,
        this._settings.temporaryEffectsRightClickBehavior
      );
    } else {
      await this._handleEffectChange(
        effect,
        this._settings.passiveEffectsRightClickBehavior
      );
    }
  }

  async _handleEffectChange(effect, rightClickBehavior) {
    if (rightClickBehavior === Constants.RIGHT_CLICK_BEHAVIOR.DIALOG) {
      const content = game.i18n.format(
        'EffectsPanel.DeleteOrDisableEffectContent',
        {
          effect: effect.name,
        }
      );
      return Dialog.wait({
        title: game.i18n.localize('EffectsPanel.DeleteOrDisableEffect'),
        content: `<h4>${content}?</h4>`,
        buttons: {
          delete: {
            icon: '<i class="fas fa-trash"></i>',
            label: game.i18n.localize('EffectsPanel.Delete'),
            callback: async () => {
              await effect.delete();
              this._viewMvc.refresh();
            },
          },
          disable: {
            icon: effect.disabled
              ? '<i class="fas fa-check"></i>'
              : '<i class="fas fa-close"></i>',
            label: effect.disabled
              ? game.i18n.localize('EffectsPanel.Enable')
              : game.i18n.localize('EffectsPanel.Disable'),
            callback: async () => {
              await effect.update({ disabled: !effect.disabled });
            },
          },
        },
      });
    } else if (rightClickBehavior === Constants.RIGHT_CLICK_BEHAVIOR.DELETE) {
      await effect.delete();
      this._viewMvc.refresh();
    } else if (rightClickBehavior === Constants.RIGHT_CLICK_BEHAVIOR.DISABLE) {
      await effect.update({ disabled: !effect.disabled });
    }
  }

  onIconDoubleClick(event) {
    const $target = $(event.currentTarget);
    const actor = this._actor;
    const effects = this._getActorEffects(actor);
    const effect = effects.find((e) => e.id === $target.attr('data-effect-id'));

    if (!effect) return;

    effect.sheet.render(true);
  }

  get _actor() {
    return canvas.tokens.controlled[0]?.actor ?? game.user?.character ?? null;
  }

  _getSecondsRemaining(duration) {
    if (duration.seconds) {
      return duration.startTime + duration.seconds - game.time.worldTime;
    } else if (duration.rounds) {
      return (duration.rounds - duration.startRound) * CONFIG.time.roundTime;
    } else {
      return Infinity;
    }
  }

  onMouseDown(ev) {
    ev.preventDefault();
    ev = ev || window.event;

    let isRightMB = false;
    if ('which' in ev) {
      // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      isRightMB = ev.which == 3;
    } else if ('button' in ev) {
      // IE, Opera
      isRightMB = ev.button == 2;
    }

    if (isRightMB) return;

    // TODO extract view logic
    dragElement(document.getElementById('effects-panel'));

    // TODO put in private functions?
    function dragElement(elmnt) {
      let newYPosition = 0,
        mouseYPosition = 0;
      let timer;

      elmnt.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup
        mouseYPosition = e.clientY;

        document.onmouseup = closeDragElement;

        // call a function whenever the cursor moves
        timer = setTimeout(() => {
          document.onmousemove = elementDrag;
        }, 200);
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        newYPosition = mouseYPosition - e.clientY;
        mouseYPosition = e.clientY;
        // set the element's new position:
        elmnt.style.top = elmnt.offsetTop - newYPosition + 'px';
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        elmnt.onmousedown = null;
        document.onmouseup = null;
        document.onmousemove = null;
        clearTimeout(timer);

        let topPosition = elmnt.offsetTop - newYPosition;
        elmnt.style.top = topPosition + 'px';

        game.user.setFlag(
          Constants.MODULE_ID,
          Constants.USER_FLAGS.TOP_POSITION,
          topPosition
        );
      }
    }
  }

  _getTopStyle() {
    let topPosition = game.user.getFlag(
      Constants.MODULE_ID,
      Constants.USER_FLAGS.TOP_POSITION
    );

    if (topPosition == undefined) {
      topPosition = 5;
      game.user.setFlag(
        Constants.MODULE_ID,
        Constants.USER_FLAGS.TOP_POSITION,
        topPosition
      );
    }

    return 'top: ' + topPosition + 'px;';
  }
}
