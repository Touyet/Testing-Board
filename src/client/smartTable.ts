import { extend } from "../commons/utils";

// eslint-disable-next-line no-undef
export interface SmartTableOptions<T> extends IntersectionObserverInit {
    addElement: (data: T) => Element;
    class?: string
}

const defaultOptions: SmartTableOptions<any> = {
    addElement: (data) => document.createElement("div"),
    class: "",
    root: document
};

function expandToBottom(container: HTMLElement, params: { margin?: number, minHeight?: number, maxHeight?: number } = {}) {
    let screenHeight = window.innerHeight;
    let containerTop = container.getBoundingClientRect().top;

    let parent = container.parentElement;
    let parentMargin = 0;
    if (parent) {
        let style = getComputedStyle(parent);
        let m = style.marginBottom;
        if (m) {
            if (m.includes("px")) {
                parentMargin = +(m.replace("px", ""));
            } else if (m.includes("%")) {
                let p = +(m.replace("%", "")) / 100;
                parentMargin = parent.parentElement.scrollHeight * p;
            }
        }
        let height = style.height;
        if (height) {
            if (height.includes("px")) {
                screenHeight = +(height.replace("px", ""));
            } else if (height.includes("%")) {
                let p = +(height.replace("%", "")) / 100;
                screenHeight = screenHeight * p;
            }
        }
    }
    let h = screenHeight - containerTop - (params?.margin ?? 0) - parentMargin;

    let minHeight = params?.minHeight ?? 0;
    let maxHeight = params?.maxHeight ?? Infinity;
    h = Math.min(maxHeight, Math.max(minHeight, h));

    container.style.height = h + "px";
}

export class SmartTable<T> {
    private maxIndex: number;
    private firstObserver: IntersectionObserver;
    private lastObserver: IntersectionObserver;
    private container: HTMLElement;

    constructor(private data: T[], private options: SmartTableOptions<T>) {

        this.options = extend(defaultOptions, this.options);

        this.maxIndex = data.length;

        let root = options.root;
        this.container = document.createElement("div");
        this.container.classList.add("smartTable");
        this.container.style.overflow = "auto";
        if (this.options.class) {
            this.container.classList.add(this.options.class);
        }

        root.append(this.container);
        expandToBottom(this.container);
        this.options.root = this.container;
        this.container.addEventListener("scroll", (ev) => {
            let last = this.container.querySelector('.card:last-child');
            let first = this.container.querySelector('.card:first-child');

            this.lastObserver.unobserve(last);
            this.lastObserver.observe(last);
            this.firstObserver.unobserve(first);
            this.firstObserver.observe(first);
        });
        this.firstObserver = new IntersectionObserver((entries, self) => this.firstObserverFunction(entries, self), options);
        this.lastObserver = new IntersectionObserver((entries, self) => this.lastObserverFunction(entries, self), options);
    }

    public refresh() {
        this.container.innerHTML = "";
        this.addElement(0);
    }

    private firstObserverFunction(entries: IntersectionObserverEntry[], self: IntersectionObserver) {
        const firstEntry = entries[0];
        const target = firstEntry.target;
        const index = +target.getAttribute("data-index");
        if (firstEntry.intersectionRatio >= 0.9 && index) {
            this.addElement(index - 1, true);
            self.unobserve(firstEntry.target);
        }
    }
    private lastObserverFunction(entries: IntersectionObserverEntry[], self: IntersectionObserver) {
        for (const entry of entries) {
            if (!entry.isIntersecting) {
                self.unobserve(entry.target);
                entry.target.remove();
            }
        }

        const lastEntry = entries.pop();
        const target = lastEntry.target;
        const index = +target.getAttribute("data-index");
        if (lastEntry.intersectionRatio >= 0.2 && index < this.maxIndex) {
            this.addElement(index + 1);
        }
    }

    private addElement(index: number, prepend = false): void {

        let target = this.options.addElement(this.data[index]);

        if (prepend) this.container.prepend(target);
        else this.container.append(target);

        target.setAttribute("data-index", index.toString());
        if (prepend) {
            this.firstObserver.observe(target);
        }
        this.lastObserver.observe(target);
        return;
    }
}