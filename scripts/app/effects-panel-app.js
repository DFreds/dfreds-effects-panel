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
      actor: this._actor,
      effects: [],
    };

    if (!data.actor) return data;

    data.effects = data.actor.effects.map((effect) => {
      const effectData = effect.clone({}, { keepId: true }).data;
      effectData.remainingSeconds = this._getSecondsRemaining(
        effectData.duration
      );
      return effectData;
    });

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
    await effect.delete();
    this.refresh();
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
