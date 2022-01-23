import Settings from '../settings.js';

/**
 * Application class for handling the UI of the effects panel
 */
export default class EffectsPanelApp extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      popOut: false,
      template: 'modules/dfreds-effects-panel/templates/effects-panel.html',
    });
  }

  /**
   * Initializes the application and its dependencies
   */
  constructor() {
    super();
    this._settings = new Settings();
    /**
     * Debounce and slightly delayed request to re-render this panel. Necessary for situations where it is not possible
     * to properly wait for promises to resolve before refreshing the UI.
     */
    this.refresh = foundry.utils.debounce(this.render.bind(this), 100);
  }

  /** @override */
  getData(options) {
    const data = {
      ...super.getData(options),
      effects: [],
    };
    const actor = this._actor;

    if (!actor) return data;

    const effects = actor.effects
      .map((effect) => {
        const effectData = effect.clone({}, { keepId: true }).data;
        effectData.remainingSeconds = this._getSecondsRemaining(
          effectData.duration
        );
        effectData.turns = effectData.duration.turns;
        effectData.isPassive = effectData.remainingSeconds === Infinity;
        effectData.isExpired = effectData.remainingSeconds < 0;
        return effectData;
      })
      .sort((a, b) => {
        if (a.isPassive) return 1;
        if (b.isPassive) return -1;
        return 0;
      })
      .filter((effectData) => {
        return (
          this._settings.showPassiveEffects || effectData.document.isTemporary
        );
      });

    data.enabledEffects = effects.filter((effectData) => !effectData.disabled);
    data.disabledEffects = effects.filter((effectData) => effectData.disabled);

    return data;
  }

  /** @override */
  activateListeners($html) {
    super.activateListeners($html);

    const $icons = $html.find('div[data-effect-id]');
    $icons.on('contextmenu', this._onIconRightClick.bind(this));
    $icons.on('dblclick', this._onIconDoubleClick.bind(this));
  }

  /**
   * Handles when the sidebar expands
   */
  handleExpand() {
    this.element.animate({ right: '310px' }, 150, () => {
      this.element.css({ right: '' });
    });
  }

  /**
   * Handles when the sidebar collapses
   */
  handleCollapse() {
    this.element.delay(250).animate({ right: '50px' }, 150);
  }

  /** @inheritdoc */
  async _render(force = false, options = {}) {
    await super._render(force, options);
    if (ui.sidebar._collapsed) {
      this.element.css('right', '50px');
    }
  }

  // TODO consider handling rounds/seconds/turns based on whatever is defined for the effect rather than do conversions
  _getSecondsRemaining(duration) {
    if (duration.seconds || duration.rounds) {
      const seconds = duration.seconds ?? duration.rounds * 6; // todo extract calculation for other systems
      return duration.startTime + seconds - game.time.worldTime;
    } else {
      return Infinity;
    }
  }

  async _onIconRightClick(event) {
    const $target = $(event.currentTarget);
    const actor = this._actor;
    const effect = actor?.effects.get($target.attr('data-effect-id') ?? '');

    if (!effect) return;

    const isEffectPassive =
      this._getSecondsRemaining(effect.data.duration) === Infinity;
    if (isEffectPassive) {
      await effect.update({ disabled: !effect.data.disabled });
    } else {
      await this._deleteEffect(effect);
    }
  }

  async _deleteEffect(effect) {
    return Dialog.confirm({
      title: 'Delete Effect',
      content: `<h4>Delete ${effect.data.label}?</h4>`,
      yes: async () => {
        await effect.delete();
        this.refresh();
      },
    });
  }

  _onIconDoubleClick(event) {
    const $target = $(event.currentTarget);
    const actor = this._actor;
    const effect = actor?.effects.get($target.attr('data-effect-id') ?? '');
    effect.sheet.render(true);
  }

  get _actor() {
    return canvas.tokens.controlled[0]?.actor ?? game.user?.character ?? null;
  }
}
