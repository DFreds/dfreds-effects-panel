declare module "draggable" {
    type DraggableLimit =
        | HTMLElement
        | ((x: number, y: number, x0: number, y0: number) => { x: number; y: number })
        | { x?: number | [number, number] | null; y?: number | [number, number] | null }
        | null;

    type DraggableEventHandler = (element: HTMLElement, x: number, y: number, event: MouseEvent | TouchEvent) => void;

    interface DraggableOptions {
        grid?: number;
        handle?: HTMLElement | null;
        filterTarget?: ((target: EventTarget) => boolean) | null;
        limit?: DraggableLimit;
        threshold?: number;
        setCursor?: boolean;
        setPosition?: boolean;
        smoothDrag?: boolean;
        useGPU?: boolean;
        onDrag?: DraggableEventHandler;
        onDragStart?: DraggableEventHandler;
        onDragEnd?: DraggableEventHandler;
    }

    export default class Draggable {
        constructor(element: HTMLElement, options?: DraggableOptions);
        get(): { x: number; y: number };
        set(x: number, y: number): this;
        setOption<K extends keyof DraggableOptions>(property: K, value: DraggableOptions[K]): this;
        setLimit(limit: DraggableLimit): void;
        destroy(): void;
    }
}
