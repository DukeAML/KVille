import { AvailabilitySlot } from '@/../common/db/availability';
export class AvailabilitySlotWrapper {
    private slot : AvailabilitySlot;
    private changeAvailability: (available: boolean) => void;
    private isInBounds : boolean;
    private row : number;
    private col : number;
    
  
    constructor(slot : AvailabilitySlot, isInBounds: boolean, row : number, col : number){
      this.slot = slot;
      this.isInBounds = isInBounds;
      this.changeAvailability = (available) => {this.slot.available = available};
      this.row = row;
      this.col = col;
    }
  
    public setAvailability(available: boolean) : void{
      console.log("in the wrapper method");
      this.changeAvailability(available);
    }
  
    public changeAvailabilitySetter(newFunction: (available: boolean) => void) : void{
      this.changeAvailability = newFunction;
  
    }
  
    public getMyAvailability() : boolean {
      return this.slot.available;
    }
  
    public setMyAvailability(available: boolean) : void {
      this.slot.available = available;
    }
  
    public getIsInBounds() : boolean {
      return this.isInBounds;
    }
  
    public getRow() : number {
      return this.row
    }
  
    public getCol() : number {
      return this.col;
    }
  
  
  }