import { checkIfNameIsForGracePeriod } from "../../../../../../common/src/scheduling/rules/gracePeriods";
import { EMPTY, GRACE } from "../../../../../../common/src/scheduling/slots/tenterSlot";

const CELL_COLORS = ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9',
  '#a4c2f4' , '#fed9c9', '#b4a7d6', '#d5a6bd', '#e69138', '#6aa84f'];

const DEFAULT_COLOR = "#ffffff";
const EMPTY_COLOR = "#ececec";
const GRACE_COLOR = "#bcb8f8";
const OUT_OF_BOUNDS_COLOR = "#bfbdfa";
export const OUT_OF_BOUNDS_NAME = "Not Part of the Schedule";

export class CellColorsCoordinator {
    private colorToName : Map<string, string>;
    constructor(){
        this.colorToName = new Map();
        this.colorToName.set(EMPTY, EMPTY_COLOR);
        this.colorToName.set(GRACE, GRACE_COLOR);
        this.colorToName.set(OUT_OF_BOUNDS_NAME, OUT_OF_BOUNDS_COLOR);

    }

    public getColorForName(name : string) : string{
        if (checkIfNameIsForGracePeriod(name)){
            let value = this.colorToName.get(GRACE);
            return value ? value : DEFAULT_COLOR;
        }
        if (this.colorToName.has(name)){
            let value = this.colorToName.get(name);
            return value ?? DEFAULT_COLOR;
        } else {
            this.addNameWithColor(name);
            let value = this.colorToName.get(name);
            return value ?? DEFAULT_COLOR;

        }
    }

    public getColorForNameGivenAllNames(name : string, allNames : string[]) : string {
        this.establishNames(allNames);
        return this.getColorForName(name);
    }

    public establishNames(names : string[]) : void {
        let sortedNames = names.sort();
        sortedNames.forEach((name, nameIndex) => this.colorToName.set(name, CELL_COLORS[nameIndex]));
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