//TODO : try abstracting a lot of this logic out to common folder
interface RowAndCol {
    row : number;
    col : number;
  }
  export class MouseTracker {
    private currentRow : number;
    private currentCol : number;
    private startRow : number;
    private startCol : number;
    private previousRow : number;
    private previousCol : number;
  
    private valueChangedToOnDragStart : boolean;
    private mouseIsDown : boolean;

    private updateAvailabilityInDB : () => void;
    private changeAvailabilityAtRowsAndCols : (rowsAndCols : RowAndCol[], available : boolean) => void;
  
  
  
    constructor () {
      this.currentRow = 0; 
      this.currentCol = 0;
      this.startRow = 0;
      this.startCol = 0;
      this.previousRow = 0; 
      this.previousCol = 0;
      this.mouseIsDown = false;
      this.valueChangedToOnDragStart = false;
      this.changeAvailabilityAtRowsAndCols = (rowsAndCols : RowAndCol[], available : boolean) => {};
      this.updateAvailabilityInDB = () => {};
    }
  
    private handleVerticalDrag() : void{
      let rowMovedCloser = Math.abs(this.currentRow - this.startRow) < Math.abs(this.previousRow - this.startRow);
      let newValue = this.valueChangedToOnDragStart;
      let rowToChange = this.currentRow;
      if (rowMovedCloser){
          newValue = !this.valueChangedToOnDragStart;
          rowToChange = this.previousRow;
      }
      let rowsAndCols : RowAndCol[] = [];
      for (let i = Math.min(this.startCol, this.currentCol); i <= Math.max(this.startCol, this.currentCol); i += 1){  
          rowsAndCols.push({row : rowToChange, col : i});             
      }
      this.changeAvailabilityAtRowsAndCols(rowsAndCols, newValue);
    }
  
    private handleHorizontalDrag() : void {
      let colMovedCloser = Math.abs(this.currentCol - this.startCol) < Math.abs(this.previousCol - this.startCol);
      let newValue = this.valueChangedToOnDragStart
      let colToChange = this.currentCol;
      if (colMovedCloser){
          newValue = !this.valueChangedToOnDragStart;
          colToChange = this.previousCol;
      }
      let rowsAndCols : RowAndCol[] = [];
      for (let i = Math.min(this.startRow, this.currentRow); i <= Math.max(this.startRow, this.currentRow); i += 1){  
          rowsAndCols.push({row : i, col : colToChange});              
      }
      this.changeAvailabilityAtRowsAndCols(rowsAndCols, newValue);
    }
  
    public alertMovementToRowCol(row : number, col : number) : void {
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
  
    public alertMouseDownAtRowColWithValueChangedTo(row : number, col : number, valueChangedToOnDragStart : boolean) : void {
  
      this.startRow = row;
      this.startCol = col;
      this.previousRow = row;
      this.previousCol = col;
      this.currentRow = row;
      this.currentCol = col;
      this.mouseIsDown = true;
      this.valueChangedToOnDragStart = valueChangedToOnDragStart;
      this.changeAvailabilityAtRowsAndCols([{row : row, col : col}], valueChangedToOnDragStart);
    }
  
    public alertMouseUpAtRowCol(row : number, col : number) : void {
      //this.updateAvailabilityInDB();
      this.mouseIsDown = false;
    }
  

  
    public setChangeAvailabilityAtRowsAndCols (newFunction : (rowsAndCols : RowAndCol[], available : boolean) => void) : void {
      this.changeAvailabilityAtRowsAndCols = newFunction;
    }
  
    public setUpdateAvailabilityInDB (newFunction : () => void) : void {
      this.updateAvailabilityInDB = newFunction;
    }
  }