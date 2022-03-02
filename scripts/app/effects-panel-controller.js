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
}
