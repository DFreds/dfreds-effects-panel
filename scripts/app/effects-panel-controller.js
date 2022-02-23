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

    const isEffectTemporary = effect.isTemporary;
    if (isEffectTemporary) {
      const shouldDisable =
        this._settings.temporaryEffectsRightClickBehavior ===
        Constants.RIGHT_CLICK_BEHAVIOR.DISABLE;
      await this._handleEffectChange(effect, shouldDisable);
    } else {
      const shouldDisable =
        this._settings.passiveEffectsRightClickBehavior ===
        Constants.RIGHT_CLICK_BEHAVIOR.DISABLE;
      await this._handleEffectChange(effect, shouldDisable);
    }
  }

  _handleEffectChange(effect, shouldDisable) {
    if (shouldDisable) {
      return effect.update({ disabled: !effect.data.disabled });
    } else {
      return this._deleteEffect(effect);
    }
  }

  async _deleteEffect(effect) {
    return Dialog.confirm({
      title: 'Delete Effect',
      content: `<h4>Delete ${effect.data.label}?</h4>`,
      yes: async () => {
        await effect.delete();
        this._viewMvc.refresh();
      },
    });
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
