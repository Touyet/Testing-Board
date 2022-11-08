import { SmartTable } from "./smartTable";

let components = {
    container: <HTMLElement>undefined,
    smartTable: <HTMLElement>undefined
};


for (const key in components) {
    if (Object.prototype.hasOwnProperty.call(components, key)) {
        components[key] = document.getElementById(key);
    } else {
        console.error(`${key} not found`);
    }
}

let arr: number[] = [];
for (let index = 0; index < 10e3; index++) {
    arr.push(index);
}

let smartTable = new SmartTable(arr, {
    root: components.container,
    addElement: (data) => {
        let div = document.createElement("div");
        div.classList.add("card");
        div.style.width = "150px";
        div.style.height = "100px";
        div.style.border = "2px solid black";
        div.style.borderRadius = "10px";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";
        div.style.margin = "15px";

        div.innerText = "Card n°" + data;

        return div;
    },
    rootMargin: "250px 0px 2500px 0px"
});

smartTable.refresh();
