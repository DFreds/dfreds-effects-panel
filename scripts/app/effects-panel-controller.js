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

  get data() {
    return {
      enabledEffects: this._enabledEffects,
      disabledEffects: this._disabledEffects,
      topStyle: this._getTopStyle(),
    };
  }

  get _enabledEffects() {
    return this._actorEffects.filter((effectData) => !effectData.disabled);
  }

  get _disabledEffects() {
    return this._actorEffects.filter((effectData) => effectData.disabled);
  }

  get _actorEffects() {
    const actor = this._actor;

    if (!actor) return [];

    return actor.effects
      .map((effect) => {
        const effectData = effect.clone({}, { keepId: true }).data;
        effectData.remainingSeconds = this._getSecondsRemaining(
          effectData.duration
        );
        effectData.turns = effectData.duration.turns;
        effectData.isTemporary = effect.isTemporary;
        effectData.isExpired = effectData.remainingSeconds < 0;
        return effectData;
      })
      .sort((a, b) => {
        if (a.isTemporary) return -1;
        if (b.isTemporary) return 1;
        return 0;
      })
      .filter((effectData) => {
        return (
          this._settings.showPassiveEffects || effectData.document.isTemporary
        );
      });
  }

  async onIconRightClick(event) {
    const $target = $(event.currentTarget);
    const actor = this._actor;
    const effect = actor?.effects.get($target.attr('data-effect-id') ?? '');

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
    if (
      rightClickBehavior === Constants.RIGHT_CLICK_BEHAVIOR.DELETE_WITH_DIALOG
    ) {
      return Dialog.confirm({
        title: 'Delete Effect',
        content: `<h4>Delete ${effect.data.label}?</h4>`,
        yes: async () => {
          await effect.delete();
          this._viewMvc.refresh();
        },
      });
    } else if (
      rightClickBehavior === Constants.RIGHT_CLICK_BEHAVIOR.DELETE_IMMEDIATELY
    ) {
      await effect.delete();
      this._viewMvc.refresh();
    } else if (rightClickBehavior === Constants.RIGHT_CLICK_BEHAVIOR.DISABLE) {
      await effect.update({ disabled: !effect.data.disabled });
    }
  }

  onIconDoubleClick(event) {
    const $target = $(event.currentTarget);
    const actor = this._actor;
    const effect = actor?.effects.get($target.attr('data-effect-id') ?? '');

    if (!effect) return;

    effect.sheet.render(true);
  }

  get _actor() {
    return canvas.tokens.controlled[0]?.actor ?? game.user?.character ?? null;
  }

  // TODO consider handling rounds/seconds/turns based on whatever is defined for the effect rather than do conversions
  _getSecondsRemaining(duration) {
    if (duration.seconds || duration.rounds) {
      const seconds =
        duration.seconds ?? duration.rounds * (CONFIG.time?.roundTime ?? 6);
      return duration.startTime + seconds - game.time.worldTime;
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
      elmnt.onmousedown = dragMouseDown;

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup
        mouseYPosition = e.clientY;

        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves
        document.onmousemove = elementDrag;
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

        let topPosition = elmnt.offsetTop - newYPosition + 1;
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
