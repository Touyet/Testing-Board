export interface SVGContext {
    translate: { x: number, y: number };
    scale: number;
}

interface Point {
    x: number;
    y: number;
}

type TransformOrder = "translation" | "rotation" | "scale" | null;

interface TransformMetadata {
    translation?: Point;
    rotation?: {
        center?: Point;
        angle: number;
    };
    scale?: number;
}


export function updateTransform(element: Element, transform: TransformMetadata, order: TransformOrder[] = ["translation", "rotation", "scale"]) {
    if (!element || !transform) return;
    let set = new Set(order); //Use a set to prevent several instance of each transformation possible

    let tranformation = "";
    set.forEach(v => {
        switch (v) {
            case "rotation":
                tranformation += `rotate(${transform.rotation?.angle ?? 0} ${transform.rotation?.center?.x ?? 0} ${transform.rotation?.center?.y ?? 0}) `;
                break;
            case "translation":
                tranformation += `translate(${transform.translation?.x ?? 0} ${transform.translation?.y ?? 0}) `;
                break;
            case "scale":
                tranformation += `scale(${transform.scale ?? 1}) `;
                break;
            default:
                break;
        }
    });

    element.setAttribute("transform", tranformation.trim());
}