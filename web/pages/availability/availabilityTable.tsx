import { AvailabilitySlot } from '@/../common/db/availability';
import {getCalendarColumnTitles, get48TimeLabels} from '../../../common/calendarAndDates/calendar_services';
import { getNumSlotsBetweenDates } from '@/../common/calendarAndDates/dates_services';
import { Grid, Paper, Container, Typography } from '@mui/material';
import { AvailabilityCell } from './availabilityCell';
import { MouseTracker } from './mouseTracker';
import { useEffect, useState, useContext } from 'react';
import { AvailabilityCalendarDatesContext } from './availabilityCalendarDatesContext';
import { AvailabilitySlotWrapper } from './availabilitySlotWrapper';


interface AvailabilityTableProps{
    originalAvailabilityArr : AvailabilitySlot[];
}



export const AvailabilityTable: React.FC<AvailabilityTableProps> = (props:AvailabilityTableProps) => {
  console.log("rendering availability table");
  const [availabilitySlotWrappers, setAvailabilitySlotWrappers] = useState<AvailabilitySlotWrapper[]>([new AvailabilitySlotWrapper(new AvailabilitySlot(new Date(Date.now()), false), false, 0, 0)]);
  const [mouseTracker, setMouseTracker] = useState<MouseTracker>(new MouseTracker());
  const {calendarStartDate, calendarEndDate} = useContext(AvailabilityCalendarDatesContext);
  useEffect(() => {
    console.log("running the useEffect in availabilityTable");
    const newWrappers = props.originalAvailabilityArr.map((slot, index) => {
      let {row, col} = indexToRowCol(index);
      return new AvailabilitySlotWrapper(slot, true, row, col);
    });
    setAvailabilitySlotWrappers((oldWrappers) => newWrappers);
    mouseTracker.setChangeAvailabilityAtRowCol(
      (row : number, col : number, available : boolean) => {
        try{
          let index = rowColToIndex(row, col);
          availabilitySlotWrappers[index].setAvailability(available);
        } catch {
          //index out of bounds, most likely
        }
      }
    );

  }, [props.originalAvailabilityArr, calendarStartDate, calendarEndDate]);



  const columnLabels = getCalendarColumnTitles(calendarStartDate, calendarEndDate);
  const rowLabels = get48TimeLabels();

  const rowColToIndex = (row : number, col: number) : number => {
    let indexOffset = getNumSlotsBetweenDates(props.originalAvailabilityArr[0].startDate, calendarStartDate);
    let index = col * 48 + row;
    index = index + indexOffset;
    return Math.round(index);
  }

  const indexToRowCol = (index : number) : {row : number, col : number} => {
    let indexOffset = getNumSlotsBetweenDates(props.originalAvailabilityArr[0].startDate, calendarStartDate);
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


  return (
    <Paper >
       
      <Grid container spacing={0} direction="column">
        {/* Empty cell at the top-left corner */}
        <Grid item/>

        {/* Column labels */}
        <Grid item container spacing={0}>
          <Grid item xs={1} /> {/* Empty cell at the top-left corner */}
          {columnLabels.map((column, index) => (
            
            <Grid item xs key={index}>
              <Paper onMouseUp={() => {console.log("entering column " + index)}}>{column}</Paper>
            </Grid>
          ))}
        </Grid>

          
        {/* Row labels and data cells */}
        {rowLabels.map((row, rowIndex) => (
          <Grid item container spacing={0} key={rowIndex}>
            {/* Row label */}
            
            <Grid item xs={1} key={rowIndex}>
              <Typography>{row}</Typography>
            </Grid>
            

            {/* Data cells */}
            {columnLabels.map((column, columnIndex) => {
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
