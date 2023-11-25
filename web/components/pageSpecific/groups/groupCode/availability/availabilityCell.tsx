import { useContext } from 'react';
import { Grid, Paper, makeStyles, Theme } from '@material-ui/core';
import { MouseTracker } from '../../../../../../common/src/frontendLogic/availability/mouseTracker';
import { AvailabilitySlot } from '../../../../../../common/src/db/availability';
import { AvailabilityPageContext } from '@/lib/pageSpecific/availability/AvailabilityPageContextType';
const useStyles = makeStyles((theme:Theme) => ({
    gridCell: {
        padding: theme.spacing(1),
        cursor: 'crosshair',
        borderRight : '1px solid black',
        borderLeft : '1px solid black'
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
    preferredCell : {
        backgroundColor : 'gold'
    },
    evenRowBorder : {
        borderTop : '2px solid black',
    },
    oddRowBorder : {
        borderTop : '1px dashed black'

    }
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
    const {settingPreferred} = useContext(AvailabilityPageContext);
    const classes = useStyles();


    const getCellColor = (available : boolean, preferred : boolean ) : string => {
        if (available && !preferred){
            return classes.availableCell;
        } else if (available && preferred) {
            return classes.preferredCell;
        } else {
            return classes.unavailableCell;
        }
    }
    const handleTouchStartOrMouseDown = () => {
        console.log("mouse down at " + props.row + ", " + props.col)
        if (settingPreferred){
            props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.row, props.col, !props.slot.preferred);
        } else {
            props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.row, props.col, !props.slot.available);
        }
    }
    const handleTouchMoveOrMouseEnter = () => {
        console.log("mouse enter at " + props.row + props.col)
        props.mouseTracker.alertMovementToRowCol(props.row, props.col);
    }
    const handleTouchEndOrMouseUp = () => {
        console.log("mouse up at " + props.row + ", " + props.col)
        props.mouseTracker.alertMouseUpAtRowCol(props.row, props.col);
		props.updateAvailabilityInDB();
    }

    return (
        <Grid item xs className={`${classes.gridCell} ${getCellColor(props.slot.available, props.slot.preferred)} ${props.row %2 == 0 ? classes.evenRowBorder : classes.oddRowBorder}`}
        	onMouseDown={handleTouchStartOrMouseDown}
            //onTouchStart={handleTouchStartOrMouseDown}
          	onMouseEnter={handleTouchMoveOrMouseEnter}
            //onTouchMove={handleTouchMoveOrMouseEnter}
			onMouseUp={handleTouchEndOrMouseUp}
            //onTouchEnd={handleTouchEndOrMouseUp}
            
            
        >
          	<Paper></Paper>
        </Grid>
    )

}