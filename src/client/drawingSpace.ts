import { SVGContext, updateTransform } from "../commons/drawingTools";
import { installInteraction, MouseButton } from "../commons/utils";
import { AssetLibrary, AssetLibraryItem, ContextMenu } from "./components";
import { initGrid } from "./grid";
import { SplitPane } from "./splitPane";

let components = {
    container: <HTMLElement>undefined,
    svgContainer: <HTMLElement>undefined,
    drawingSpace: <HTMLElement>undefined,
    patterns: <HTMLElement>undefined,
    gridPattern: <HTMLElement>undefined,
    rightPanel: <HTMLElement>undefined
};


for (const key in components) {
    if (Object.prototype.hasOwnProperty.call(components, key)) {
        components[key] = document.getElementById(key);
    } else {
        console.error(`${key} not found`);
    }
}

let splitPane = new SplitPane(components.container, components.svgContainer, components.rightPanel, {
    ratio: 85,
    handleCSS: { size: "12px", backgroundColor: '#3d3d3d' },
    direction: 'horizontal',
    // locked: true
});
splitPane.init();

let svgContainerBbox = components.svgContainer.getBoundingClientRect();
let context: SVGContext = {
    translate: { x: svgContainerBbox.width / 2, y: svgContainerBbox.height / 2 },
    scale: 1
};

initGrid(components.patterns, components.gridPattern);

updateTransform(components.drawingSpace, { translation: context.translate, scale: context.scale }, ["scale", "translation"]);

let currentMousePosition = { x: 0, y: 0 };

installInteraction(components.drawingSpace, {
    button: MouseButton.MIDDLE,
    start: (ev) => {
        currentMousePosition.x = ev.pageX / context.scale;
        currentMousePosition.y = ev.pageY / context.scale;
    },
    move: (ev) => {
        let currentPos = {
            x: ev.pageX / context.scale,
            y: ev.pageY / context.scale
        };
        let delta = { x: currentPos.x - currentMousePosition.x, y: currentPos.y - currentMousePosition.y };
        context.translate.x += delta.x;
        context.translate.y += delta.y;

        currentMousePosition = currentPos;
        updateTransform(components.drawingSpace, { translation: context.translate, scale: context.scale }, ["scale", "translation"]);
    },
    finish: (ev) => { },
    cursor: "move"
});

components.drawingSpace.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    let zoomIn = ev.deltaY < 0;
    if (context.scale < 0.1 && !zoomIn) return;
    if (context.scale > 10 && zoomIn) return;
    let delta = zoomIn ? 1.1 : 0.9;
    let px = context.translate.x * context.scale;
    let py = context.translate.y * context.scale;
    let p2x = (px - ev.pageX) * delta + ev.pageX;
    let p2y = (py - ev.pageY) * delta + ev.pageY;
    context.scale *= delta;

    context.translate.x = p2x / context.scale;
    context.translate.y = p2y / context.scale;

    updateTransform(components.drawingSpace, { translation: context.translate, scale: context.scale }, ["scale", "translation"]);
});



type AssetLibraryCategories = "shape" | 'line';
let assetLibrary = new AssetLibrary<AssetLibraryCategories>(components.rightPanel, {
    categoryCSS: { backgroundColor: '#3d3d3d', color: "white" }
});

let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
rect.setAttribute('x', '0');
rect.setAttribute('y', '0');
rect.setAttribute('width', '30');
rect.setAttribute('height', '15');
svg.append(rect);
svg.style.width = "50px";
svg.setAttribute('draggable', 'true');
let items: AssetLibraryItem<AssetLibraryCategories>[] = [
    {
        category: "shape",
        img: svg,
        name: "Rectangle"
    },
    {
        category: "shape",
        img: "",
        name: "Square"
    },
    {
        category: "shape",
        img: "",
        name: "Circle"
    },
    {
        category: "shape",
        img: "",
        name: "Polygon"
    },
    {
        category: "line",
        img: "",
        name: "Line"
    }
];
assetLibrary.addItems(...items);
assetLibrary.refresh();

let cm = new ContextMenu(components.container.querySelector('svg'));
cm.addItem('option1', { text: "Option 1" });
cm.addItem('option2', { text: "Option 2" });
cm.addItem('option3', { text: "Option 3" });
cm.addItem('s1', "separator");
cm.addItem('option4', { text: "Option 4" });
cm.addItem('option5', { text: "Option 5" });
cm.addItem('option6', { text: "Option 6" });

cm.addItem("subOption1", { text: "Sub Option 1", parentItem: "option2" });
cm.addItem("subOption2", { text: "Sub Option 2", parentItem: "option2" });
cm.addItem("subOption3", { text: "Sub Option 3", parentItem: "option2" });
cm.addItem("subOption4", { text: "Sub Option 4", parentItem: "option2" });

cm.addItem("subSubOption1", { text: "Sub Sub Option 1", parentItem: "subOption2" });
cm.addItem("subSubOption2", { text: "Sub Sub Option 2", parentItem: "subOption2" });
cm.addItem("subSubOption3", { text: "Sub Sub Option 3", parentItem: "subOption2" });
cm.addItem("subSubOption4", { text: "Sub Sub Option 4", parentItem: "subOption2" });

cm.addItem("subSubSubOption1", { text: "Sub Sub Sub Option 1", parentItem: "subOption4" });
cm.addItem("subSubSubOption2", { text: "Sub Sub Sub Option 2", parentItem: "subOption4" });
cm.addItem("subSubSubOption3", { text: "Sub Sub Sub Option 3", parentItem: "subOption4" });
cm.addItem("subSubSubOption4", { text: "Sub Sub Sub Option 4", parentItem: "subOption4" });
cm.build();