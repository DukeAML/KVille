//TODO : try abstracting a lot of this logic out to common folder
export class MouseTracker {
  private currentRow : number;
  private currentCol : number;
  private startRow : number;
  private startCol : number;
  private previousRow : number;
  private previousCol : number;

  private valueChangedToOnDragStart : boolean;
  private mouseIsDown : boolean;

  private changeAvailabilityAtRowCol : (row : number, col : number, available : boolean ) => void;



  constructor () {
    this.currentRow = 0; 
    this.currentCol = 0;
    this.startRow = 0;
    this.startCol = 0;
    this.previousRow = 0; 
    this.previousCol = 0;
    this.mouseIsDown = false;
    this.valueChangedToOnDragStart = false;
    this.changeAvailabilityAtRowCol = (row : number, col : number, available : boolean ) => {

    };
  }

  private handleVerticalDrag() : void{
    let rowMovedCloser = Math.abs(this.currentRow - this.startRow) < Math.abs(this.previousRow - this.startRow);
    let newValue = this.valueChangedToOnDragStart;
    let rowToChange = this.currentRow;
    if (rowMovedCloser){
        newValue = !this.valueChangedToOnDragStart;
        rowToChange = this.previousRow;
    }
    for (let i = Math.min(this.startCol, this.currentCol); i <= Math.max(this.startCol, this.currentCol); i += 1){               
        this.changeAvailabilityAtRowCol(rowToChange, i, newValue);
    }
  }

  private handleHorizontalDrag() : void {
    let colMovedCloser = Math.abs(this.currentCol - this.startCol) < Math.abs(this.previousCol - this.startCol);
    let newValue = this.valueChangedToOnDragStart
    let colToChange = this.currentCol;
    if (colMovedCloser){
        newValue = !this.valueChangedToOnDragStart;
        colToChange = this.previousCol;
    }
    for (let i = Math.min(this.startRow, this.currentRow); i <= Math.max(this.startRow, this.currentRow); i += 1){                
        this.changeAvailabilityAtRowCol(i, colToChange, newValue);
    }
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
    this.changeAvailabilityAtRowCol(row, col, valueChangedToOnDragStart);
  }

  public alertMouseUpAtRowCol(row : number, col : number) : void {
    //call to db
    this.mouseIsDown = false;
  }

  public setChangeAvailabilityAtRowCol (newFunction : (row : number, col : number, available : boolean ) => void) : void {
    this.changeAvailabilityAtRowCol = newFunction;
  }
}