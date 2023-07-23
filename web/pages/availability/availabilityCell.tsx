import { Grid, Paper, makeStyles, Theme } from '@material-ui/core';
import { AvailabilitySlotWrapper } from './availabilityTable';
import { MouseTracker } from './mouseTracker';
import { useState, useEffect } from 'react';

const useStyles = makeStyles((theme:Theme) => ({
  gridCell: {
    border: '1px solid black',
    padding: theme.spacing(1),
  },
  rowLabelCell: {
    border: '1px solid black',
    borderTop: 'none', // Remove the top border
    padding: `${theme.spacing(1)}px 0`, // Top padding to align row labels
  },
  unavailableCell: {
    backgroundColor: 'red',
  },
  availableCell: {
    backgroundColor: 'green',
  },
}));

interface AvailabilityCellProps{
    slotWrapper : AvailabilitySlotWrapper;
    mouseTracker : MouseTracker;
}

export const AvailabilityCell :  React.FC<AvailabilityCellProps> = (props:AvailabilityCellProps) => {
    const classes = useStyles();
    const [availableHere, setAvailableHere] = useState<boolean>(props.slotWrapper.getMyAvailability());
    useEffect(() => {
      //.log("setting to " + props.slotWrapper.getMyAvailability());
      setAvailableHere((oldAvailability) => props.slotWrapper.getMyAvailability());
      props.slotWrapper.changeAvailabilitySetter((available: boolean) => {
        console.log("trying to change cell to " + available + " and it currently is " + availableHere);
        setAvailableHere((old) => available);
        props.slotWrapper.setMyAvailability(available);
      });
    }, [props.slotWrapper]);
    
    if (props.slotWrapper.getRow() == 0 && props.slotWrapper.getRow() == 0){
      //console.log("in cell, available? " + props.slotWrapper.getMyAvailability() + " but state is " + availableHere);
    }
    //console.log("in cell, available? " + props.slotWrapper.getMyAvailability() + " but state is " + availableHere);
    console.log("rendering cell at " + props.slotWrapper.getRow() + ", " + props.slotWrapper.getCol());

    const getCellColor = (available : boolean ) : string => {
        if (available){
            return classes.availableCell;
        } else {
            return classes.unavailableCell;
        }
    }
    return (
        <Grid item xs className={`${classes.gridCell} ${getCellColor(availableHere)}`}
          onMouseDown={() => {
            console.log("mouse down at " + props.slotWrapper.getRow() + ", " + props.slotWrapper.getCol());
            props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.slotWrapper.getRow(), props.slotWrapper.getCol(), !availableHere)
          }}
          onMouseEnter={() => {
            console.log("entered cell at " + props.slotWrapper.getRow() + ", " + props.slotWrapper.getCol());
            props.mouseTracker.alertMovementToRowCol(props.slotWrapper.getRow(), props.slotWrapper.getCol())
          }}
          onMouseUp={() => {
            console.log("mouse up at cell at " + props.slotWrapper.getRow() + ", " + props.slotWrapper.getCol());
            props.mouseTracker.alertMouseUpAtRowCol(props.slotWrapper.getRow(), props.slotWrapper.getCol())
          }}
        >
          <Paper></Paper>
        </Grid>
    )

}