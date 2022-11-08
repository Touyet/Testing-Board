import { capitalize, extend, installInteraction } from '../commons/utils';

interface SplitPaneOptions {
    ratio: number;
    direction: 'horizontal' | 'vertical';
    handleCSS: Partial<CSSStyleDeclaration & { size: string; }>;
    handleClass: string;
    locked: boolean;
    maxSplit: number
}
const defaultOptions: SplitPaneOptions = {
    ratio: 50,
    direction: 'horizontal',
    handleCSS: { size: '6px' },
    handleClass: "",
    locked: false,
    maxSplit: 85
};
type SplitPaneDirection = {
    constant: 'height' | 'width';
    dimension: 'width' | 'height';
    flex: 'row' | 'column';
    mouse: 'movementX' | 'movementY';
};

export class SplitPane {
    private handle: HTMLElement;
    private options: SplitPaneOptions;
    private delta = 0;
    private direction: SplitPaneDirection;

    constructor(private container: HTMLElement, private left: HTMLElement, private right: HTMLElement, options: Partial<SplitPaneOptions> = {}) {
        this.handle = document.createElement('div');
        this.options = extend(defaultOptions, options);
        this.options.handleCSS = extend(defaultOptions.handleCSS, options.handleCSS);

        if (this.options.direction == 'horizontal') {
            if (!('cursor' in this.options.handleCSS)) this.options.handleCSS.cursor = 'col-resize';
            this.direction = { constant: 'height', dimension: 'width', flex: 'row', mouse: 'movementX' };
        } else {
            if (!('cursor' in this.options.handleCSS)) this.options.handleCSS.cursor = 'row-resize';
            this.direction = { dimension: 'height', constant: 'width', flex: 'column', mouse: 'movementY' };
        }

        if (!(this.direction.dimension in this.options.handleCSS)) this.options.handleCSS[this.direction.dimension] = this.options.handleCSS.size;
        delete this.options.handleCSS[this.direction.constant];
        delete this.options.handleCSS.size;

        if (this.options.locked) delete this.options.handleCSS.cursor;
    }

    public init() {
        this.container.style.display = 'flex';
        this.container.style.flexDirection = this.direction.flex;
        this.container.append(this.left, this.handle, this.right);

        this.left.style[this.direction.constant] = this.container.style[this.direction.constant];
        this.right.style[this.direction.constant] = this.container.style[this.direction.constant];

        this.left.style["max" + capitalize(this.direction.dimension)] = `${this.options.maxSplit}%`;
        this.left.style["min" + capitalize(this.direction.dimension)] = `${100 - this.options.maxSplit}%`;
        this.right.style["min" + capitalize(this.direction.dimension)] = `${100 - this.options.maxSplit}%`;
        this.right.style["max" + capitalize(this.direction.dimension)] = `${this.options.maxSplit}%`;

        this.handle.style[this.direction.constant] = this.container.style[this.direction.constant];
        extend(this.handle.style, this.options.handleCSS, true);

        if (this.options.handleClass) this.handle.classList.add(this.options.handleClass);

        if (!this.options.locked) {

            installInteraction(this.handle, {
                start: (event) => { },
                move: (event) => {
                    this.delta += event[this.direction.mouse];
                    this.updateRatio();
                },
                finish: (event) => { },
                root: this.container
            });
        }

        this.updateRatio();
    }

    public updateRatio() {
        this.left.style[this.direction.dimension] = `calc(${this.options.ratio}% + ${this.delta}px)`;
        this.right.style[this.direction.dimension] = `calc(${100 - this.options.ratio}% - ${this.delta}px)`;
    }
}
