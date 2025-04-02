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

    protected override async _render(
        force?: boolean | undefined,
        options?: RenderOptions | undefined,
    ): Promise<void> {
        await super._render(force, options);
        this.setFromRightPx(false);
    }

    setFromRightPx(animate: boolean): void {
        const isSidebarExpanded = document
            .getElementById("sidebar-content")
            ?.classList.contains("expanded");
        const isWebrtcRight =
            ui.webrtc?.element?.classList.contains("right") ?? false;

        const padding = 18;
        const sidebarWidth = isSidebarExpanded ? 348 : 48;
        const webrtcWidth = isWebrtcRight ? 300 : 0;

        if (animate) {
            this.element.animate(
                {
                    right: padding + sidebarWidth + webrtcWidth,
                },
                {
                    duration: 200,
                },
            );
        } else {
            this.element.css(
                "right",
                `${padding + sidebarWidth + webrtcWidth}px`,
            );
        }
    }

    get #icons(): JQuery<HTMLElement> {
        return this.#rootView.find("div[data-effect-id]");
    }

    get #dragHandler(): JQuery<HTMLElement> {
        return this.#rootView.find("#effects-panel-drag-handler");
    }
}

export { EffectsPanelApp };
