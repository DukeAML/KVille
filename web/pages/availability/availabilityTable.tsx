import { AvailabilitySlot } from '@/../common/db/availability';
import {getCalendarColumnTitles} from '../../../common/calendarAndDates/calendar_services';
import { getNumSlotsBetweenDates } from '@/../common/services/dates_services';
import { Grid, Paper, Container, Typography } from '@mui/material';
import { AvailabilityCell } from './availabilityCell';
import { MouseTracker } from './mouseTracker';
import { useEffect, useState } from 'react';
import { KvilleButton } from '@/components/button';
import { table } from 'console';

interface AvailabilityTableProps{
    originalAvailabilityArr : AvailabilitySlot[];
    displayStartDate : Date;
    displayEndDate : Date;
}

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



export const AvailabilityTable: React.FC<AvailabilityTableProps> = (props:AvailabilityTableProps) => {
  console.log("rendering availability table");
  const [availabilitySlotWrappers, setAvailabilitySlotWrappers] = useState<AvailabilitySlotWrapper[]>([new AvailabilitySlotWrapper(new AvailabilitySlot(new Date(Date.now()), false), false, 0, 0)]);
  const [mouseTracker, setMouseTracker] = useState<MouseTracker>(new MouseTracker());
  useEffect(() => {
    const newWrappers = props.originalAvailabilityArr.map((slot, index) => {
      let {row, col} = indexToRowCol(index);
      return new AvailabilitySlotWrapper(slot, true, row, col);
    });
    setAvailabilitySlotWrappers((oldWrappers) => newWrappers);
    mouseTracker.setChangeAvailabilityAtRowCol(changeAvailabilityAtRowCol);

  }, [props.originalAvailabilityArr]);



  const columns = getCalendarColumnTitles(props.displayStartDate, props.displayEndDate);
  const rows = new Array(48).fill("time");

  const rowLabels = new Array(48).fill("time");
  const rowColToIndex = (row : number, col: number) : number => {
    let indexOffset = getNumSlotsBetweenDates(props.originalAvailabilityArr[0].startDate, props.displayStartDate);
    let index = col * 48 + row;
    index = index + indexOffset;
    return Math.round(index);
  }

  const indexToRowCol = (index : number) : {row : number, col : number} => {
    let indexOffset = getNumSlotsBetweenDates(props.originalAvailabilityArr[0].startDate, props.displayStartDate);
    let tableIndex = index - indexOffset;
    let row = tableIndex % 48;
    let col = Math.floor(tableIndex / 48);
    return {row, col};
  }

  const cellIsInBounds = (index : number) : boolean => {
    if ((index < 0) ||(index >= availabilitySlotWrappers.length) ) {
      return false;
    } else {
      return true;
    }
  } 

  const changeAvailabilityAtRowCol = (row : number, col : number, available : boolean) => {
    try{
      let index = rowColToIndex(row, col);
      availabilitySlotWrappers[index].setAvailability(available);
    } catch {
      //index out of bounds, most likely
    }
  }

  return (
    <Paper >
       
      <Grid container spacing={0} direction="column">
        {/* Empty cell at the top-left corner */}
        <Grid item/>

        {/* Column labels */}
        <Grid item container spacing={0}>
          <Grid item xs={1} /> {/* Empty cell at the top-left corner */}
          {columns.map((column, index) => (
            
            <Grid item xs key={index}>
              <Paper onMouseUp={() => {console.log("entering column " + index)}}>{column}</Paper>
            </Grid>
          ))}
        </Grid>

          
        {/* Row labels and data cells */}

        <KvilleButton onClick={() => {
          console.log("button was pressed");
          availabilitySlotWrappers[2].setAvailability(!availabilitySlotWrappers[2].getMyAvailability())
          }} >
          <Typography >press here to change cell 0</Typography>
        </KvilleButton>
        {rows.map((row, rowIndex) => (
          <Grid item container spacing={0} key={rowIndex}>
            {/* Row label */}
            
            <Grid item xs={1} key={rowIndex}>
              <Paper onMouseEnter={() => {console.log("entered the column label " + rowIndex)}}>{row}</Paper >
            </Grid>
            

            {/* Data cells */}
            {columns.map((column, columnIndex) => {
              const correspondingIndex = rowColToIndex(rowIndex, columnIndex);
              const isInBounds = cellIsInBounds(correspondingIndex);
              const correspondingWrapper = isInBounds ? availabilitySlotWrappers[correspondingIndex] : new AvailabilitySlotWrapper(new AvailabilitySlot(new Date(Date.now()), false), false, rowIndex, columnIndex);
              return (
              <AvailabilityCell mouseTracker={mouseTracker} slotWrapper={correspondingWrapper} key={columnIndex}/>
              );
            })}
          </Grid>
        ))}

      </Grid>
    </Paper>
  );
}
