import { extend, getSiblings, is, isValue, MouseButton, Point } from '../commons/utils';

export interface AssetLibraryItem<C extends string> {
    name: string;
    img: string | HTMLElement | SVGElement;
    category: C
}

interface AssetLibraryOptions {
    categoryCSS: Partial<CSSStyleDeclaration>;
    categoryClass: string;
    itemCSS: Partial<CSSStyleDeclaration>;
    itemClass: string;
}

const defaultAssetLibraryOptions: AssetLibraryOptions = {
    categoryCSS: {},
    categoryClass: '',
    itemCSS: {},
    itemClass: ""
};


export class AssetLibrary<C extends string = string, I extends AssetLibraryItem<C> = AssetLibraryItem<C>> {

    private library: HTMLElement;
    private items: I[];
    private categories: Set<C>;
    private options: AssetLibraryOptions;

    constructor(private container: HTMLElement, options: Partial<AssetLibraryOptions> = {}) {
        this.library = document.createElement('div');
        this.items = [];
        this.categories = new Set();
        this.options = extend(defaultAssetLibraryOptions, options);
        this.options.categoryCSS = extend(defaultAssetLibraryOptions.categoryCSS, options.categoryCSS);
        this.options.itemCSS = extend(defaultAssetLibraryOptions.itemCSS, options.itemCSS);

        this.library.style.width = "100%";
        this.library.style.height = container.style.height;

        this.container.append(this.library);
    }

    public addCategories(...c: C[]) { c.forEach(v => this.categories.add(v)); }
    public addItems(...items: I[]) {
        items.forEach(item => {
            this.items.push(item);
            this.addCategories(item.category);
        });
    }

    public refresh() {
        this.library.innerHTML = '';
        this.categories.forEach(category => {

            //TODO : CSS
            let categoryHeader = document.createElement("div");
            categoryHeader.style.width = "100%";
            categoryHeader.style.height = "25px";
            categoryHeader.style.justifyContent = "center";
            if (this.options.categoryClass) categoryHeader.classList.add(this.options.categoryClass);
            extend(categoryHeader.style, this.options.categoryCSS, true);
            categoryHeader.style.display = "flex";
            categoryHeader.style.alignItems = "center";

            let a = document.createElement('a');
            a.text = category;
            a.style.textTransform = "capitalize";
            a.ariaExpanded = "true";
            a.href = "#" + category;
            a.style.textDecoration = "none";
            a.style.color = "inherit";

            a.setAttribute('data-bs-toggle', 'collapse');

            categoryHeader.append(a);

            let categoryBody = document.createElement('div');
            categoryBody.style.width = "100%";
            categoryBody.id = category;
            categoryBody.classList.add('collapse', 'show');

            let categoryBodyContent = document.createElement('div');
            categoryBodyContent.style.display = "flex";
            categoryBodyContent.style.width = "100%";
            categoryBodyContent.style.flexWrap = "wrap";

            categoryBody.append(categoryBodyContent);

            let items = this.items.filter(i => i.category === category);
            items.forEach(item => {
                let itemDiv = document.createElement('div');
                // itemDiv.innerText = item.name;
                itemDiv.style.height = "50px";
                itemDiv.style.width = "50%";
                itemDiv.style.display = "flex";
                itemDiv.style.justifyContent = "center";
                itemDiv.style.alignItems = "center";
                itemDiv.style.flexDirection = "column";
                itemDiv.style.borderBottom = "1px solid black";
                itemDiv.style.borderRight = "1px solid black";
                // itemDiv.draggable = true;
                itemDiv.append(item.img);

                categoryBodyContent.append(itemDiv);
            }); //TODO : Add items

            this.library.append(categoryHeader, categoryBody);
        });
    }
}


interface ContextMenuOptions {
    classList: string[];
}

const defaultContextMenuOptions: ContextMenuOptions = {
    classList: []
};


export interface ContextMenuItem {
    text: string;
    callback?: (event: MouseEvent) => void;
    display?: boolean | (() => boolean);
    id?: string
}
export interface ContextMenuSubItem extends ContextMenuItem {
    parentItem: string;
}

type ContextMenuItemLike = "separator" | ContextMenuItem | ContextMenuSubItem;


export class ContextMenu {
    private contextMenu: HTMLDivElement;
    private contextMenuSubItem: HTMLDivElement;
    private options: ContextMenuOptions;
    private contextMenuItems: Record<string, ContextMenuItemLike>;
    private contextMenuSubItemMap: Record<string, boolean>;

    constructor(private container: Element, options: Partial<ContextMenuOptions> = {}) {
        this.options = extend(defaultContextMenuOptions, options);
        this.contextMenu = document.createElement('div');
        this.contextMenu.classList.add("context-menu", ...this.options.classList);

        this.contextMenuSubItem = this.contextMenu.cloneNode() as HTMLDivElement;

        this.contextMenuItems = {};
        this.contextMenuSubItemMap = {};

        container.addEventListener('contextmenu', (event) => {
            let mouseEvent = event as MouseEvent;
            event.preventDefault();
            event.stopImmediatePropagation();
            const mousePosition = { x: mouseEvent.clientX, y: mouseEvent.clientY };
            this.show(mousePosition);
        });

        document.addEventListener('click', event => {
            if (event.button == MouseButton.RIGHT) return;
            this.hide();
        });

        this.container.parentElement.append(this.contextMenu);
    }

    public build() {
        //Start by emptying the context menu
        this.contextMenu.innerHTML = "";

        for (const category in this.contextMenuItems) {
            if (Object.prototype.hasOwnProperty.call(this.contextMenuItems, category)) {
                const contextMenuItem = this.contextMenuItems[category];

                let itemDiv = this.buildContextMenuItem(category, contextMenuItem);

                if (is<ContextMenuSubItem>(contextMenuItem, "parentItem")) {
                    let contextMenuDiv = this.contextMenu.querySelector('#' + contextMenuItem.parentItem + "subItems");
                    contextMenuDiv.append(itemDiv);
                } else this.contextMenu.append(itemDiv);
            }
        }
    }

    private buildContextMenuItem(id: string, contextMenuItem: ContextMenuItemLike) {
        let itemDiv = document.createElement('div');
        itemDiv.id = id;
        if (contextMenuItem === "separator") {
            itemDiv.append(document.createElement('hr'));
            itemDiv.classList.add('separator');
        } else {
            itemDiv.innerText = contextMenuItem.text;
            itemDiv.classList.add('context-menu-item');

            contextMenuItem.id = id;

            if (contextMenuItem.callback) {
                itemDiv.addEventListener('click', (event) => contextMenuItem.callback(event));
            }

            if (isValue(contextMenuItem.display)) {
                let showItem = true;
                if (typeof contextMenuItem.display === "boolean")
                    showItem = contextMenuItem.display;
                else
                    showItem = contextMenuItem.display();

                if (!showItem)
                    itemDiv.style.display = "none";
            }

            if (this.contextMenuSubItemMap[id]) {
                let i = document.createElement('i');
                i.classList.add("fa-solid", "fa-chevron-right");
                i.style.pointerEvents = "none";
                itemDiv.append(i);

                const clone = this.contextMenuSubItem.cloneNode() as HTMLElement;
                clone.id = id + "subItems";
                clone.style.display = "none";
                this.contextMenu.append(clone);

                itemDiv.addEventListener('mouseover', (event) => {
                    clone.style.display = "";
                    let itemPosition = itemDiv.getBoundingClientRect();
                    let contextMenuPosition = this.contextMenu.getBoundingClientRect();
                    itemPosition.x -= contextMenuPosition.x - itemPosition.width;
                    itemPosition.y -= contextMenuPosition.y;
                    clone.style.top = itemPosition.y + "px";
                    clone.style.left = itemPosition.x + "px";

                    if (!itemDiv.classList.contains('active')) {
                        clone.classList.remove('visible');
                        setTimeout(() => {
                            clone.classList.add('visible');
                        }, 10);
                    }
                    itemDiv.classList.add("active");
                });
            } else {
                itemDiv.addEventListener('mouseover', (event) => {
                    this.hideSubMenus(...this.getItemIdToIgnore(contextMenuItem));
                    getSiblings(itemDiv).forEach((element, index) => {
                        let that = element as HTMLElement;
                        that.classList.remove("active");
                    });
                });
            }


        }
        return itemDiv;
    }

    public addItem(id: string, item: ContextMenuItemLike) {
        this.contextMenuItems[id] = item;

        if (is<ContextMenuSubItem>(item, "parentItem")) {
            this.contextMenuSubItemMap[item.parentItem] = true;
        }
    }

    private getItemIdToIgnore(item: ContextMenuItemLike): string[] {
        if (item === "separator") return [];
        let res = [];
        if (is<ContextMenuSubItem>(item, "parentItem")) {
            res.push(item.parentItem + "subItems", ...this.getItemIdToIgnore(this.contextMenuItems[item.parentItem]));
        }
        return res;
    }

    private normalizeMousePosition(point: Point, target?: HTMLElement) {

        target = target ?? this.contextMenu;
        let containerBbox = this.container.getBoundingClientRect();
        let positionInContainer = {
            x: point.x - containerBbox.left,
            y: point.y - containerBbox.top
        };

        let isOobX = positionInContainer.x + target.clientWidth > containerBbox.width;
        let isOobY = positionInContainer.y + target.clientHeight > containerBbox.height;

        if (isOobX) {
            point.x -= target.clientWidth;
        }
        if (isOobY) {
            point.y -= target.clientHeight;
        }
        return point;
    }
    private show(mousePosition: { x: number; y: number; }) {
        mousePosition = this.normalizeMousePosition(mousePosition);
        this.contextMenu.style.top = mousePosition.y + "px";
        this.contextMenu.style.left = mousePosition.x + "px";
        this.contextMenu.classList.remove('visible');
        this.hideSubMenus();
        setTimeout(() => {
            this.contextMenu.classList.add('visible');
        }, 10);
    }
    private hide() {
        this.contextMenu.classList.remove('visible');
        this.contextMenu.querySelectorAll('.active').forEach((element, index) => {
            let that = element as HTMLElement;
            that.classList.remove('active');
        });
        this.hideSubMenus();
    }

    private hideSubMenus(...ignore: string[]) {
        this.contextMenu.querySelectorAll('.visible').forEach((element, index) => {
            let that = element as HTMLElement;
            if (ignore.includes(that.id)) return;
            that.classList.remove('visible');
            that.style.display = "none";
        });
    }
}

