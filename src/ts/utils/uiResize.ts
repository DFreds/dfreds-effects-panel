import { getEffectsPanel } from "./gets.ts";

/**
 * Repositions the effects panel whenever the right-docked UI changes size.
 *
 * A ResizeObserver on #ui-right reacts to:
 *   - the sidebar expanding/collapsing (its width animates, and the observer
 *     fires for each frame of the transition so the panel tracks it smoothly),
 *   - a system changing the sidebar width,
 *   - the interface scale changing (#ui-right's height is derived from
 *     --ui-scale, so a scale change resizes its box immediately), and
 *   - the window being resized.
 */
function uiResize() {
    const target =
        document.getElementById("ui-right") ??
        document.getElementById("sidebar");
    if (!target) return;

    const observer = new ResizeObserver(() => {
        getEffectsPanel()?.updateLeftPosition();
    });
    observer.observe(target);
}

export { uiResize };
