import { useContext } from 'react';
import { Grid, Paper, makeStyles, Theme, Typography } from '@material-ui/core';
import { MouseTracker } from '@/lib/calendarAndDatesUtils/availability/mouseTracker';
import { AvailabilitySlot } from "@/lib/controllers/availabilityController";
import { AvailabilityPageContext } from '@/lib/context/AvailabilityPageContextType';
const useStyles = makeStyles((theme:Theme) => ({
    gridCell: {
        padding: theme.spacing(1),
        cursor: 'crosshair',
        borderRight : '1px solid black',
        borderLeft : '1px solid black',
        userDrag: 'none',
        userSelect: 'none'
    },
    rowLabelCell: {
        border: '1px solid black',
        borderTop: 'none', // Remove the top border
        padding: `${theme.spacing(1)}px 0`, // Top padding to align row labels
    },
    outOfBoundsCell : {
        backgroundColor : 'gray',
        cursor : 'not-allowed',
    },
    unavailableCell: {
        backgroundColor: 'red',
    },
    availableCell: {
        backgroundColor: 'green',
    },
    preferredCell : {
        backgroundColor : 'gold'
    },
    colorblindCell : {
        backgroundColor : 'white'
    },
    evenRowBorder : {
        borderTop : '2px solid black',
    },
    oddRowBorder : {
        borderTop : '1px dashed black'

    }
}));

const getCellText = (available : boolean, preferred : boolean, inBounds : boolean) : string => {
    if (inBounds){
        if (available && preferred){
            return "p";
        } else if (available && !preferred){
            return "a";
        } else {
            return "u";
        }
    } else {
        return "x";
    }

}

interface AvailabilityCellProps{
    slot : AvailabilitySlot;
    row : number;
    col : number;
    inBounds : boolean;
    mouseTracker : MouseTracker;
    updateAvailabilityInDB : () => void;
}



export const AvailabilityCell :  React.FC<AvailabilityCellProps> = (props:AvailabilityCellProps) => {
    const {settingPreferred, colorblindModeIsOn} = useContext(AvailabilityPageContext);
    const classes = useStyles();


    const getCellColor = (available : boolean, preferred : boolean ) : string => {
        if (colorblindModeIsOn){
            return classes.colorblindCell
        } else if (!props.inBounds){
            return classes.outOfBoundsCell;
        } if (available && !preferred){
            return classes.availableCell;
        } else if (available && preferred) {
            return classes.preferredCell;
        } else {
            return classes.unavailableCell;
        }
    }

     
    const handleMouseDown = () => {
        if (props.inBounds){
            let newVal = !props.slot.available;
            if (settingPreferred){
                newVal = !props.slot.preferred;
            }
            props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.row, props.col, newVal);
            if (!props.mouseTracker.isDragging){
                props.updateAvailabilityInDB();
            }
        }
    }
    const handleMouseEnter = () => {
        if (props.inBounds){
            props.mouseTracker.alertMovementToRowCol(props.row, props.col);
        } 
    }


    return (
        <Grid item xs className={`${classes.gridCell} ${getCellColor(props.slot.available, props.slot.preferred)} ${props.row %2 == 0 ? classes.evenRowBorder : classes.oddRowBorder}`}
        	onMouseDown={handleMouseDown}
          	onMouseEnter={handleMouseEnter}                   
        >
         
                {colorblindModeIsOn ? <Typography>{getCellText(props.slot.available, props.slot.preferred, props.inBounds)}</Typography> : null}
           
        </Grid>
    )

}