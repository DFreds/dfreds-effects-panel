import EffectsPanelController from './effects-panel-controller.js';

/**
 * Application class for handling the UI of the effects panel
 */
export default class EffectsPanelApp extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'effects-panel',
      popOut: false,
      template: 'modules/dfreds-effects-panel/templates/effects-panel.html',
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

    this._initialSidebarWidth = ui.sidebar.element.outerWidth();
  }

  /** @override */
  getData(options) {
    return this._controller.data;
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

  /**
   * Handles when the sidebar expands
   */
  handleExpand() {
    const right = this._initialSidebarWidth + 18 + 'px';
    this.element.animate({ right: right }, 150);
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
    } else {
      this.element.css('right', this._initialSidebarWidth + 18 + 'px');
    }
  }

  get _icons() {
    return this._rootView.find('div[data-effect-id]');
  }

  get _dragHandler() {
    return this._rootView.find('#effects-panel-drag-handler');
  }
}
