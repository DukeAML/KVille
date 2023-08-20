import { AvailabilitySlot, setDBAvailability } from '@/../common/db/availability';
import {getCalendarColumnTitles, get48TimeLabels} from '../../../../../common/calendarAndDates/calendar_services';
import { getNumSlotsBetweenDates } from '@/../common/calendarAndDates/dates_services';
import { Grid, Paper, Container, Typography } from '@mui/material';
import { AvailabilityCell } from './availabilityCell';
import { MouseTracker } from './mouseTracker';
import { useEffect, useState, useContext } from 'react';
import { AvailabilityCalendarDatesContext } from './availabilityCalendarDatesContext';
import { GroupContext } from '@/context/groupContext';
import { UserContext } from '@/context/userContext';
import { useQueryClient } from 'react-query';

interface RowAndCol {
    row : number;
    col : number;
}

interface AvailabilityTableProps{
    originalAvailabilityArr : AvailabilitySlot[];
}



export const AvailabilityTable: React.FC<AvailabilityTableProps> = (props:AvailabilityTableProps) => {
  console.log("rendering availability table");
  //const [availabilitySlotWrappers, setAvailabilitySlotWrappers] = useState<AvailabilitySlotWrapper[]>([new AvailabilitySlotWrapper(new AvailabilitySlot(new Date(Date.now()), false), false, 0, 0)]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(props.originalAvailabilityArr);
  
  const [mouseTracker, setMouseTracker] = useState<MouseTracker>(new MouseTracker());
  const {calendarStartDate, calendarEndDate} = useContext(AvailabilityCalendarDatesContext);
  const queryClient = useQueryClient();
  useEffect(() => {
    setAvailability(props.originalAvailabilityArr);
  }, [props.originalAvailabilityArr, calendarStartDate, calendarEndDate]);
  const {groupDescription} = useContext(GroupContext);
  const {userID} = useContext(UserContext);

  const updateAvailabilityInDB = () => {
    let newAvailabilitySlots = availability.map((slot, index) => {
      return new AvailabilitySlot(slot.startDate, slot.available);
    });
    console.log("new availability slots is ");
    console.log(newAvailabilitySlots);
    queryClient.setQueryData("getAvailability", newAvailabilitySlots);
    setDBAvailability(groupDescription.groupCode, userID, newAvailabilitySlots);
  }



  const changeAvailabilityAtRowsAndCols = (rowsAndCols : RowAndCol[], newValue : boolean) => {
    let newAvailability = [...availability];
    for (let i = 0; i < rowsAndCols.length; i += 1){
        let row = rowsAndCols[i].row;
        let col = rowsAndCols[i].col;
        let index = rowColToIndex(row, col);
        if (index >= 0 && index < newAvailability.length){
            newAvailability[index].available = newValue;
        }
        
    }
    setAvailability(newAvailability);
  }

  mouseTracker.setChangeAvailabilityAtRowsAndCols(changeAvailabilityAtRowsAndCols);


  const columnLabels = getCalendarColumnTitles(calendarStartDate, calendarEndDate);
  const rowLabels = get48TimeLabels();

  const rowColToIndex = (row : number, col: number) : number => {
    let indexOffset = getNumSlotsBetweenDates(props.originalAvailabilityArr[0].startDate, calendarStartDate);
    let index = col * 48 + row;
    index = index + indexOffset;
    return Math.round(index);
  }

 

  const cellIsInBounds = (index : number) : boolean => {
    if ((index < 0) ||(index >= availability.length) ) {
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
              const correspondingSlot = isInBounds ? availability[correspondingIndex] : new AvailabilitySlot(new Date(Date.now()), false);
              return (
              <AvailabilityCell mouseTracker={mouseTracker} slot={correspondingSlot} row={rowIndex} col={columnIndex} inBounds={isInBounds} updateAvailabilityInDB={updateAvailabilityInDB} key={columnIndex}/>
              );
            })}
          </Grid>
        ))}

      </Grid>
    </Paper>
  );
}
