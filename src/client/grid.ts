
let gridPatterns = [8, 80, 160, 320];

export function initGrid(defs: HTMLElement, grid: HTMLElement) {
    for (let index = 0; index < gridPatterns.length; index++) {
        const patternValue = gridPatterns[index];
        let pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");

        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("height", patternValue.toString());
        pattern.setAttribute("width", patternValue.toString());
        pattern.id = "grid" + index;

        if (index) {
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("height", patternValue.toString());
            rect.setAttribute("width", patternValue.toString());
            rect.setAttribute('fill', `url(#grid${index - 1})`);

            pattern.append(rect);
        }
        let path = document.createElementNS('http://www.w3.org/2000/svg', "path");
        let d = `M ${patternValue} 0 L 0 0 0 ${patternValue}`;

        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute('stroke-width', (1 / (2 ** (gridPatterns.length - (index + 1)))).toString());
        path.setAttribute('stroke', "gray");

        pattern.append(path);

        defs.append(pattern);
    }

    grid.setAttribute('fill', `url(#grid${gridPatterns.length - 1})`);

}
