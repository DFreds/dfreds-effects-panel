import EffectsPanelController from './effects-panel-controller.js';

/**
 * Application class for handling the UI of the effects panel
 */
export default class EffectsPanelApp extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'effects-panel',
      popOut: false,
      template: 'modules/dfreds-effects-panel/templates/effects-panel.hbs',
    });
  }

  /**
   * Initializes the application and its dependencies
   */
  constructor() {
    super();

    this._controller = new EffectsPanelController(this);

    /**
     * Debounce and slightly delayed request to re-render this panel. Necessary for situations where it is not possible
     * to properly wait for promises to resolve before refreshing the UI.
     */
    this.refresh = foundry.utils.debounce(this.render.bind(this), 100);
  }

  /** @override */
  async getData(options) {
    return await this._controller.getEffectData();
  }

  /** @override */
  activateListeners($html) {
    this._rootView = $html;

    this._icons.on(
      'contextmenu',
      this._controller.onIconRightClick.bind(this._controller)
    );
    this._icons.on(
      'dblclick',
      this._controller.onIconDoubleClick.bind(this._controller)
    );
    this._dragHandler.on(
      'mousedown',
      this._controller.onMouseDown.bind(this._controller)
    );
  }

  updateFromRightPx() {
    this.element.animate({ right: this._fromRightPx });
  }

  /** @inheritdoc */
  async _render(force = false, options = {}) {
    await super._render(force, options);
    this.element.css('right', this._fromRightPx);
  }

  get _icons() {
    return this._rootView.find('div[data-effect-id]');
  }

  get _dragHandler() {
    return this._rootView.find('#effects-panel-drag-handler');
  }

  get _fromRightPx() {
    if (ui.webrtc.element.hasClass('camera-position-right')) {
      return (
        ui.sidebar.element.outerWidth() +
        ui.webrtc.element.outerWidth() +
        18 +
        'px'
      );
    } else {
      return ui.sidebar.element.outerWidth() + 18 + 'px';
    }
  }
}
