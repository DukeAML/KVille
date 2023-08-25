const CELL_COLORS = ['#ececec', '#3c78d8', '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9',
  '#a4c2f4' , '#fed9c9', '#b4a7d6', '#d5a6bd', '#e69138', '#6aa84f'];

const DEFAULT_COLOR = "#ffffff";

export class CellColorsCoordinator {
    private colorToName : Map<string, string>;
    constructor(){
        this.colorToName = new Map();
        this.colorToName.set("empty", "ececec");

    }

    public getColorForName(name : string) : string{
        if (this.colorToName.has(name)){
            let value = this.colorToName.get(name);
            return value ?? DEFAULT_COLOR;
        } else {
            this.addNameWithColor(name);
            let value = this.colorToName.get(name);
            return value ?? DEFAULT_COLOR;

        }
    }

    private addNameWithColor(name : string) : void {
        if (this.colorToName.has(name)){
            return;
        } else {
            let size = this.colorToName.size;
            this.colorToName.set(name, CELL_COLORS[size % CELL_COLORS.length]);
        }
    }

}