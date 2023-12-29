export class MouseTracker {
    #currentRow;
    #currentCol;
    #startRow;
    #startCol;
    #previousRow;
    #previousCol;
  
    #valueChangedToOnDragStart;
    #mouseIsDown;

    #updateAvailabilityInDB;
    #changeAvailabilityAtRowsAndCols;
  
  
  
    constructor () {
		this.currentRow = 0; 
		this.currentCol = 0;
		this.startRow = 0;
		this.startCol = 0;
		this.previousRow = 0; 
		this.previousCol = 0;
		this.mouseIsDown = false;
		this.valueChangedToOnDragStart = false;
		this.changeAvailabilityAtRowsAndCols = (rowsAndCols, available) => {};
		this.updateAvailabilityInDB = () => {};
    }
  
    /**
     * @returns {void}
     */
handleVerticalDrag() {
    let rowMovedCloser = Math.abs(this.currentRow - this.startRow) < Math.abs(this.previousRow - this.startRow);
    let newValue = this.valueChangedToOnDragStart;

    if (rowMovedCloser) {
        newValue = !this.valueChangedToOnDragStart;
    }

    let rowsAndCols = [];
    let startRow = Math.min(this.previousRow, this.currentRow) + 1; // +1 to make it exclusive
    let endRow = this.currentRow;

    for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
        for (let i = Math.min(this.startCol, this.currentCol); i <= Math.max(this.startCol, this.currentCol); i++) {
            rowsAndCols.push({ row: r, col: i });
        }
    }

    this.changeAvailabilityAtRowsAndCols(rowsAndCols, newValue);
}

  
    /**
     * @returns {void}
     */
handleHorizontalDrag() {
    let colMovedCloser = Math.abs(this.currentCol - this.startCol) < Math.abs(this.previousCol - this.startCol);
    let newValue = this.valueChangedToOnDragStart;

    if (colMovedCloser) {
        newValue = !this.valueChangedToOnDragStart;
    }

    let rowsAndCols = [];
    let startCol = Math.min(this.previousCol, this.currentCol) + 1; // +1 to make it exclusive
    let endCol = this.currentCol;

    for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
        for (let i = Math.min(this.startRow, this.currentRow); i <= Math.max(this.startRow, this.currentRow); i++) {
            rowsAndCols.push({ row: i, col: c });
        }
    }

    this.changeAvailabilityAtRowsAndCols(rowsAndCols, newValue);
}

  
    /**
     * 
     * @param {number} row 
     * @param {number} col 
     * @returns {void}
     */
    alertMovementToRowCol(row, col)  {
		if (!this.mouseIsDown){
			return;
		}
	
		this.previousRow = this.currentRow;
		this.previousCol = this.currentCol;
		this.currentRow = row;
		this.currentCol = col;
	
		if (this.currentRow != this.previousRow) {
			this.handleVerticalDrag();
		}
		if (this.currentCol != this.previousCol) {
			this.handleHorizontalDrag();
		}
    }
  
    /**
     * 
     * @param {number} row 
     * @param {number} col 
     * @param {boolean} valueChangedToOnDragStart 
     * @returns {void}
     */
    alertMouseDownAtRowColWithValueChangedTo(row, col, valueChangedToOnDragStart ) {
  
		this.startRow = row;
		this.startCol = col;
		this.previousRow = row;
		this.previousCol = col;
		this.currentRow = row;
		this.currentCol = col;
		this.mouseIsDown = true;
		this.valueChangedToOnDragStart = valueChangedToOnDragStart;
		this.changeAvailabilityAtRowsAndCols([{row : row, col : col}], valueChangedToOnDragStart);
    setTimeout(() => {
      this.mouseIsDown = false;
    }, 1000);
    }

    alertMouseUpOutOfBounds(){
      this.mouseIsDown = false;
    }
  
    /**
     * 
     * @param {number} row 
     * @param {number} col 
     * @returns {void}
     */
    alertMouseUpAtRowCol(row, col ){
		this.mouseIsDown = false;
    }
  

  
    /**
     * 
     * @param {(rowsAndCols : {row : number, col : number}[], available : boolean) => void} newFunction 
     * @returns {void}
     */
    setChangeAvailabilityAtRowsAndCols (newFunction ) {
		this.changeAvailabilityAtRowsAndCols = newFunction;
    }
  
    /**
     * 
     * @param {() => void} newFunction 
     * @returns {void}
     */
    setUpdateAvailabilityInDB (newFunction ) {
		this.updateAvailabilityInDB = newFunction;
    }
}

