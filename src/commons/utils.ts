
export function extend<T>(obj: T, attrs: Partial<T>, overrideObject = false): T {
    let res: T = { ...obj };
    if (!attrs) return res;
    for (const attr in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, attr)) {
            const val = attrs[attr];
            if (overrideObject) obj[attr] = val;
            else res[attr] = val;
        }
    }

    return res;
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isValue(val: any): boolean {
    return val !== null && val !== undefined;
}

export function is<T>(val: any, ...properties: (keyof T)[]): val is T {
    for (const property of properties) {
        if (!Object.prototype.hasOwnProperty.call(val, property)) return false;
    }
    return true;
}

export function getSiblings(element: HTMLElement) {
    // for collecting siblings
    let siblings: Element[] = [];
    // if no parent, return no sibling
    if (!element.parentNode) {
        return siblings;
    }
    // first child of the parent node
    let sibling = element.parentNode.firstChild as Element;

    // collecting siblings
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== element) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling as Element;
    }
    return siblings;
}

export function installInteraction(target: HTMLElement, options: InteractionOptions) {
    let previousCursor: string = "";
    let interactionStarted = false;
    target.addEventListener("mousedown", (event) => {
        if (options.button == null || options.button == event.button) {
            interactionStarted = true;
            options.start(event);
            if (options.cursor) {
                previousCursor = target.style.cursor || "default";
                target.style.cursor = options.cursor;
            }
        }
    });

    let moveTarget = options.root ?? target;

    moveTarget.addEventListener("mousemove", (event) => {
        if (interactionStarted && (event.movementX || event.movementY)) {
            options.move(event);
        }
    });
    moveTarget.addEventListener("mouseup", (event) => {
        if (interactionStarted) {
            if (options.cursor) target.style.cursor = previousCursor;
            interactionStarted = false;
            options.finish(event);
        }
    });
    moveTarget.addEventListener("mouseleave", (event) => {
        if (interactionStarted) {
            if (options.cursor) target.style.cursor = previousCursor;
            interactionStarted = false;
            options.finish(event);
        }
    });
}

export enum MouseButton {
    LEFT = 0,
    MIDDLE,
    RIGHT
}

interface InteractionOptions {
    start: (event: MouseEvent) => void;
    move: (event: MouseEvent) => void;
    finish: (event: MouseEvent) => void;
    button?: MouseButton;
    cursor?: string;
    root?: HTMLElement;
}

export interface Point {
    x: number,
    y: number
}