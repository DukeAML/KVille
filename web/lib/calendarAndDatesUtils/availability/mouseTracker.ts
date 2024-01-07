export class MouseTracker {
	currentRow : number;
	currentCol : number;
	startRow : number;
	startCol : number;
	previousRow : number;
	previousCol : number;
	isDragging : boolean;
	valueChangedToOnDragStart : boolean;
	changeAvailabilityAtRowsAndCols : (rowsAndCols : {row : number, col : number}[], available : boolean, valueChangedToOnDragStart : boolean) => void;
	updateAvailabilityInDB : () => void;
	visitedRowsAndColsArr : {row : number, col : number}[];
	visitedRowsAndColsSet : Set<string>

    constructor () {
		this.currentRow = 0; 
		this.currentCol = 0;
		this.startRow = 0;
		this.startCol = 0;
		this.previousRow = 0; 
		this.previousCol = 0;
		this.isDragging = false;
		this.valueChangedToOnDragStart = false;
		this.changeAvailabilityAtRowsAndCols = (rowsAndCols, available, b) => {};
		this.updateAvailabilityInDB = () => {};
		this.visitedRowsAndColsArr = [];
		this.visitedRowsAndColsSet = new Set();
    }
  
	colMovedCloser() : boolean {
		return (Math.abs(this.currentCol - this.startCol) < Math.abs(this.previousCol - this.startCol));
	}

	rowMovedCloser() : boolean {
		return Math.abs(this.currentRow - this.startRow) < Math.abs(this.previousRow - this.startRow);
	}

	handleVerticalDrag() {
		let rowMovedCloser = Math.abs(this.currentRow - this.startRow) < Math.abs(this.previousRow - this.startRow);
		let newValue = this.valueChangedToOnDragStart;

		if (rowMovedCloser) {
			newValue = !this.valueChangedToOnDragStart;
		} 

		let rowsAndCols = [];
		let startRow = this.previousRow;
		let endRow = this.currentRow;

		for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
			for (let i = Math.min(this.startCol, this.currentCol); i <= Math.max(this.startCol, this.currentCol); i++) {
				rowsAndCols.push({ row: r, col: i });
			}
		}

		this.changeAvailabilityAtRowsAndCols(rowsAndCols, newValue, this.valueChangedToOnDragStart);
	}


	
	handleHorizontalDrag() {
		let colMovedCloser = this.colMovedCloser();
		let newValue = this.valueChangedToOnDragStart;

		if (colMovedCloser) {
			newValue = !this.valueChangedToOnDragStart;
		} 

		let rowsAndCols = [];
		let startCol = this.previousCol; 
		let endCol = this.currentCol;

		for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
			for (let i = Math.min(this.startRow, this.currentRow); i <= Math.max(this.startRow, this.currentRow); i++) {
				rowsAndCols.push({ row: i, col: c });
			}
		}

		this.changeAvailabilityAtRowsAndCols(rowsAndCols, newValue, this.valueChangedToOnDragStart);
	}

	ensureBoundingBoxIsCorrect(){
		let rowsAndCols = []
		for (let row = Math.min(this.startRow, this.currentRow); row <= Math.max(this.startRow, this.currentRow); row++) {
			for (let col = Math.min(this.startCol, this.currentCol); col <= Math.max(this.startCol, this.currentCol); col++) {
				rowsAndCols.push({ row, col });
			}
		}
		this.changeAvailabilityAtRowsAndCols(rowsAndCols, this.valueChangedToOnDragStart, this.valueChangedToOnDragStart);
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

	
	updateVisitedRowsAndCols(){
		for (let row = Math.min(this.startRow, this.currentRow); row <= Math.max(this.startRow, this.currentRow); row += 1){
			for (let col = Math.min(this.startCol, this.currentCol); col <= Math.max(this.startCol, this.currentCol); col += 1){
				if (!this.checkIfRowColHasBeenVisited(row, col)){
					this.addRowColToVisitedList(row, col);
				}
			}
		}
	}

	revertVisitedRowColsOutsideBoundingBox(){
		let rowsAndColsToRevert : {row : number, col : number}[]= []
		let rowsAndCols = this.getAllVisitedRowCols();
		console.log(rowsAndCols);
		rowsAndCols.map(({row, col}, index) => {
			if (row <= Math.max(this.startRow, this.currentRow) && row >= Math.min(this.startRow, this.currentRow) && col <= Math.max(this.startCol, this.currentCol) && col >= Math.min(this.startCol, this.currentCol)){
				return;
			} else {
				rowsAndColsToRevert.push({row, col});
			}
				
		});
		this.changeAvailabilityAtRowsAndCols(rowsAndColsToRevert, !this.valueChangedToOnDragStart, this.valueChangedToOnDragStart);
	}
	
  
    alertMovementToRowCol(row : number, col : number)  {
		if (!this.isDragging){
			return;
		}
		this.previousRow = this.currentRow;
		this.previousCol = this.currentCol;
		this.currentRow = row;
		this.currentCol = col;

		/*
		if (this.currentRow != this.previousRow) {
			this.handleVerticalDrag();
		}
		if (this.currentCol != this.previousCol) {
			this.handleHorizontalDrag();
		}*/
		this.updateVisitedRowsAndCols();
		this.ensureBoundingBoxIsCorrect();
		this.revertVisitedRowColsOutsideBoundingBox();
		
    }
  
    alertStartOfDragAtRowColWithValueChangedTo(row : number, col : number, valueChangedToOnDragStart: boolean ) {
  
		this.startRow = row;
		this.startCol = col;
		this.previousRow = row;
		this.previousCol = col;
		this.currentRow = row;
		this.currentCol = col;
		this.isDragging = true;
		this.valueChangedToOnDragStart = valueChangedToOnDragStart;
		this.changeAvailabilityAtRowsAndCols([{row, col}], valueChangedToOnDragStart, valueChangedToOnDragStart);
		this.visitedRowsAndColsArr = [{row, col}];
		this.visitedRowsAndColsSet.add(this.getStrForRowCol(row, col));

    }

    alertMouseUpOutOfBounds(){
		this.isDragging = false;
		this.visitedRowsAndColsArr = [];
		this.visitedRowsAndColsSet.clear();
    }

    alertEndOfDragAtRowCol(row : number, col : number ){
		this.alertMovementToRowCol(row, col);
		this.isDragging = false;
		this.visitedRowsAndColsArr = [];
		this.visitedRowsAndColsSet.clear();
    }

    alertMouseDownAtRowColWithValueChangedTo(row : number, col : number, valueChangedToOnDragStart : boolean ) {
		if (this.isDragging){
			this.alertEndOfDragAtRowCol(row, col);
		} else {
			this.alertStartOfDragAtRowColWithValueChangedTo(row, col, valueChangedToOnDragStart);
		}

	}
  


    setChangeAvailabilityAtRowsAndCols (newFunction :  (rowsAndCols : {row : number, col : number}[], available : boolean, valueChangedToOnDragStart : boolean) => void) {
		this.changeAvailabilityAtRowsAndCols = newFunction;
    }
  

    setUpdateAvailabilityInDB (newFunction: () => void ) {
		this.updateAvailabilityInDB = newFunction;
    }
}

