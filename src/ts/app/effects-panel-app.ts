import { EffectsPanelController } from "./effects-panel-controller.ts";

class EffectsPanelApp extends Application {
    #controller: EffectsPanelController;
    #rootView: JQuery<HTMLElement>;

    refresh: AnyFunction;

    constructor() {
        super();
        this.#controller = new EffectsPanelController(this);
        this.#rootView = $("<div>"); // Init it to something for now

        /**
         * Debounce and slightly delayed request to re-render this panel.
         * Necessary for situations where it is not possible to properly wait
         * for promises to resolve before refreshing the UI.
         */
        this.refresh = foundry.utils.debounce(this.render.bind(this), 100);
    }

    static override get defaultOptions(): ApplicationOptions {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "effects-panel",
            popOut: false,
            template:
                "modules/dfreds-effects-panel/templates/effects-panel.hbs",
        });
    }

    override async getData(
        _options?: Partial<ApplicationOptions> | undefined,
    ): Promise<object> {
        return await this.#controller.getData();
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        this.#rootView = html;

        this.#icons.on(
            "contextmenu",
            this.#controller.onIconRightClick.bind(this.#controller),
        );
        this.#icons.on(
            "dblclick",
            this.#controller.onIconDoubleClick.bind(this.#controller),
        );
        this.#dragHandler.on(
            "mousedown",
            this.#controller.onMouseDown.bind(this.#controller),
        );
    }

    updateFromRightPx(): void {
        this.element.animate({ right: this.#fromRightPx });
    }

    protected override async _render(
        force?: boolean | undefined,
        options?: RenderOptions | undefined,
    ): Promise<void> {
        await super._render(force, options);
        this.element.css("right", this.#fromRightPx);
    }

    get #icons(): JQuery<HTMLElement> {
        return this.#rootView.find("div[data-effect-id]");
    }

    get #dragHandler(): JQuery<HTMLElement> {
        return this.#rootView.find("#effects-panel-drag-handler");
    }

    get #fromRightPx(): string {
        const sidebarOuterWidth = ui.sidebar.element.outerWidth() || 0;

        if (ui.webrtc.element.hasClass("camera-position-right")) {
            const webrtcOuterWidth = ui.webrtc.element.outerWidth() || 0;
            const locationInPx = sidebarOuterWidth + webrtcOuterWidth + 18;

            return `${locationInPx}px`;
        } else {
            return sidebarOuterWidth + 18 + "px";
        }
    }
}

export { EffectsPanelApp };
