export class VisitedRowsAndColsTracker {
    visitedRowsAndColsArr : {row : number, col : number}[];
	visitedRowsAndColsSet : Set<string>;

    constructor () {
		this.visitedRowsAndColsArr = [];
		this.visitedRowsAndColsSet = new Set();
    }

    getStrForRowCol(row : number, col : number) : string {
		return "r" + row + "c" + col;
	}
	checkIfRowColHasBeenVisited(row : number, col : number) : boolean{
		return this.visitedRowsAndColsSet.has(this.getStrForRowCol(row, col));
	}

	addRowColToVisitedList(row : number, col : number) {
		if (!this.checkIfRowColHasBeenVisited(row, col)){
			this.visitedRowsAndColsArr.push({row, col});
			this.visitedRowsAndColsSet.add(this.getStrForRowCol(row, col));
		}
	}

	getAllVisitedRowCols() : {row : number, col : number}[] {
		return this.visitedRowsAndColsArr;
	}

    clear() {
        this.visitedRowsAndColsArr = [];
        this.visitedRowsAndColsSet.clear();
    }
}