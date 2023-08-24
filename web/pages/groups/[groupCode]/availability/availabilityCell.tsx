import { Grid, Paper, makeStyles, Theme } from '@material-ui/core';
import { MouseTracker } from './mouseTracker';
import { useState, useEffect, useContext } from 'react';
import { GroupContext } from '@/context/groupContext';
import { AvailabilitySlot } from '../../../../../common/src/db/availability';

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
    slot : AvailabilitySlot;
    row : number;
    col : number;
    inBounds : boolean;
    mouseTracker : MouseTracker;
    updateAvailabilityInDB : () => void;
}

export const AvailabilityCell :  React.FC<AvailabilityCellProps> = (props:AvailabilityCellProps) => {
    const classes = useStyles();


    const getCellColor = (available : boolean ) : string => {
        if (available){
            return classes.availableCell;
        } else {
            return classes.unavailableCell;
        }
    }
    return (
        <Grid item xs className={`${classes.gridCell} ${getCellColor(props.slot.available)}`}
          onMouseDown={() => {
            console.log("mouse down at " + props.row + ", " + props.col);
            props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.row, props.col, !props.slot.available)
          }}
          onMouseEnter={() => {
            //console.log("entered cell at " + props.slotWrapper.getRow() + ", " + props.slotWrapper.getCol());
            props.mouseTracker.alertMovementToRowCol(props.row, props.col);
          }}
          onMouseUp={() => {
            console.log("mouse up at cell at " + props.row + ", " + props.col);
            props.mouseTracker.alertMouseUpAtRowCol(props.row, props.col);
            props.updateAvailabilityInDB();
          }}
        >
          <Paper></Paper>
        </Grid>
    )

}