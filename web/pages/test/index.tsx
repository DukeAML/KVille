import React, {useMemo, useState} from "react";

import { MouseTracker } from "../groups/[groupCode]/availability/mouseTracker";

import { Grid, Paper, makeStyles, Theme } from '@material-ui/core';
interface RowAndCol {
    row : number;
    col : number;
}

const TestPage : React.FC = () => {
    const numDays = 7;
    const [availability, setAvailability] = useState<boolean[]>(new Array(48 * numDays).fill(true));
    const [mouseTracker, setMouseTracker] = useState<MouseTracker>(new MouseTracker());
    const changeAvailabilityAtRowCol = (row : number, col : number, newValue : boolean) => {
        let newAvailability = [...availability];
        let index = col * 48 + row;

        newAvailability[index] = !newAvailability[index];
        //setAvailability(newAvailability);
    }

    const changeAvailabilityAtRowsAndCols = (rowsAndCols : RowAndCol[], newValue : boolean) => {
        let newAvailability = [...availability];
        for (let i = 0; i < rowsAndCols.length; i += 1){
            let row = rowsAndCols[i].row;
            let col = rowsAndCols[i].col;
            let index = col * 48 + row;
            newAvailability[index] = newValue;


        }
        setAvailability(newAvailability);
    }

    mouseTracker.setChangeAvailabilityAtRowsAndCols(changeAvailabilityAtRowsAndCols);

    const mouseUpHandler = () => {
        console.log(availability);
    }

    return (
        <div>
            {(new Array(48).fill(true)).map((num, rowIndex : number) => 
                <Grid item container spacing={0} key={rowIndex}>
                    {(new Array(numDays).fill(true)).map((num, colIndex) => {
                        let index = colIndex * 48 + rowIndex;
                        return <MyCell row={rowIndex} col={colIndex} value={availability[index]} mouseTracker={mouseTracker} key={colIndex} mouseUpHandler={mouseUpHandler}/>
                    })}
                </Grid>
            )}
        </div>
    )
}

interface MyCellProps {
    row : number;
    col : number;
    value : boolean;
    mouseTracker : MouseTracker;
    mouseUpHandler : () => void;

}

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
const MyCell : React.FC<MyCellProps> = (props : MyCellProps) => {
    const classes = useStyles();
    const getCellColor = (available : boolean ) : string => {
        if (available){
            return classes.availableCell;
        } else {
            return classes.unavailableCell;
        }
    }
    return (
        <Grid item xs className={`${classes.gridCell} ${getCellColor(props.value)}`}
          onMouseDown={() => {
            console.log("mouse down at " + props.row + ", " + props.col);
            props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.row, props.col, !props.value)
          }}
          onMouseEnter={() => {
            //console.log("entered cell at " + props.slotWrapper.getRow() + ", " + props.slotWrapper.getCol());
            props.mouseTracker.alertMovementToRowCol(props.row, props.col)
          }}
          onMouseUp={() => {
            console.log("mouse up at cell at " + props.row + ", " + props.col);
            props.mouseTracker.alertMouseUpAtRowCol(props.row, props.col);
            props.mouseUpHandler();
           
          }}
        >
          <Paper></Paper>
        </Grid>
    )
}

export default TestPage;