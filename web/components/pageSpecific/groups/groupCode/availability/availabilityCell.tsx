import { useContext } from 'react';
import { Grid, Paper, makeStyles, Theme } from '@material-ui/core';
import { MouseTracker } from '../../../../../../common/src/frontendLogic/availability/mouseTracker';
import { AvailabilitySlot } from '../../../../../../common/src/db/availability';
import { AvailabilityPageContext } from '@/lib/pageSpecific/availability/AvailabilityPageContextType';
const useStyles = makeStyles((theme:Theme) => ({
    gridCell: {
        border: '1px solid black',
        padding: theme.spacing(1),
        cursor: 'crosshair'
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
    return (
        <Grid item xs className={`${classes.gridCell} ${getCellColor(props.slot.available, props.slot.preferred)}`}
        	onMouseDown={() => {
                if (settingPreferred){
                    props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.row, props.col, !props.slot.preferred);
                } else {
                    props.mouseTracker.alertMouseDownAtRowColWithValueChangedTo(props.row, props.col, !props.slot.available);
                }
          	}}
          	onMouseEnter={() => {
				//console.log("entered cell at " + props.slotWrapper.getRow() + ", " + props.slotWrapper.getCol());
				props.mouseTracker.alertMovementToRowCol(props.row, props.col);
			}}
			onMouseUp={() => {
				props.mouseTracker.alertMouseUpAtRowCol(props.row, props.col);
				props.updateAvailabilityInDB();
			}}
            
        >
          	<Paper></Paper>
        </Grid>
    )

}