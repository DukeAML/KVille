import { AvailabilitySlot, setDBAvailability } from '../../../../../../common/src/db/availability';
import {getCalendarColumnTitles, get48TimeLabels} from '../../../../../../common/src/calendarAndDates/calendarUtils';
import { getNumSlotsBetweenDates } from '@/../common/src/calendarAndDates/datesUtils';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { AvailabilityCell } from './availabilityCell';
import {MouseTracker} from '../../../../../../common/src/frontendLogic/availability/mouseTracker';
import { useEffect, useState, useContext } from 'react';
import { AvailabilityPageContext } from '@/lib/pageSpecific/availability/AvailabilityPageContextType';
import { UserContext } from '@/lib/shared/context/userContext';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { INVALID_GROUP_CODE } from '../../../../../../common/src/db/groupExistenceAndMembership/GroupCode';
import { getQueryKeyNameForFetchAvailability } from '../../../../../lib/pageSpecific/availability/availabilityHooks';
import { TimeColumn } from '@/components/shared/utils/timeColumn';
import { useCheckIfScreenIsNarrow } from '@/lib/shared/windowProperties';

interface RowAndCol {
    row : number;
    col : number;
}

interface AvailabilityTableProps{
    originalAvailabilityArr : AvailabilitySlot[];
}


export const AvailabilityTable: React.FC<AvailabilityTableProps> = (props:AvailabilityTableProps) => {
    const {isNarrow, checkingIfNarrow} = useCheckIfScreenIsNarrow();
    const [availability, setAvailability] = useState<AvailabilitySlot[]>(props.originalAvailabilityArr);
    
    const [mouseTracker, setMouseTracker] = useState<MouseTracker>(new MouseTracker());
    const {calendarStartDate, calendarEndDate, settingPreferred, setSettingPreferred} = useContext(AvailabilityPageContext);
    const queryClient = useQueryClient();
    useEffect(() => {
        setAvailability(props.originalAvailabilityArr);
    }, [props.originalAvailabilityArr, calendarStartDate, calendarEndDate]);

    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const {userID} = useContext(UserContext);

    const updateAvailabilityInDB = () => {
        let newAvailabilitySlots = availability.map((slot, index) => {
            return new AvailabilitySlot(slot.startDate, slot.available, slot.preferred);
        });
        queryClient.setQueryData(getQueryKeyNameForFetchAvailability(groupCode, userID), newAvailabilitySlots);
        setDBAvailability(groupCode, userID, newAvailabilitySlots);
    }



    const changeBasicAvailabilityAtRowsAndCols = (rowsAndCols : RowAndCol[], newValue : boolean) => {
        let newAvailability = [...availability];
        for (let i = 0; i < rowsAndCols.length; i += 1){
            let row = rowsAndCols[i].row;
            let col = rowsAndCols[i].col;
            let index = rowColToIndex(row, col);
            if (index >= 0 && index < newAvailability.length){
                if (newValue == false){
                    newAvailability[index].available = false;
                    newAvailability[index].preferred = false;
                } else {
                    newAvailability[index].available = true;
                }
                
            }
        }
        setAvailability(newAvailability);
    }

    const changePreferredAvailabilityAtRowsAndCols = (rowsAndCols : RowAndCol[], newValue : boolean) => {
        let newAvailability = [...availability];
        for (let i = 0; i < rowsAndCols.length; i += 1){
            let row = rowsAndCols[i].row;
            let col = rowsAndCols[i].col;
            let index = rowColToIndex(row, col);
            if (index >= 0 && index < newAvailability.length){
                if (newValue == false){
                    newAvailability[index].preferred = false;
                } else {
                    newAvailability[index].available = true;
                    newAvailability[index].preferred = true;
                }
                
            }
            
        }
        setAvailability(newAvailability);
    }

    useEffect(() => {
        console.log("setting preferred has changed to " + settingPreferred);
        if (settingPreferred){
            mouseTracker.setChangeAvailabilityAtRowsAndCols(changePreferredAvailabilityAtRowsAndCols);
        } else {
            mouseTracker.setChangeAvailabilityAtRowsAndCols(changeBasicAvailabilityAtRowsAndCols);
        }

    }, [settingPreferred]);


    let columnLabels = getCalendarColumnTitles(calendarStartDate, calendarEndDate, isNarrow);

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
        <Grid container spacing={0} direction="column" style={{marginTop : "20px", touchAction : "none"}}>

            {/* Column labels */}
            <Grid item container spacing={0}>
                <Grid item xs={2.5} sm={1} /> {/* Empty cell at the top-left corner */}
                {columnLabels.map((column, index) => (
                
                    <Grid item xs key={index}>
                        <Paper  onMouseUp={() => {console.log("entering column " + index)}}>
                            <Typography align="center" fontWeight={"bold"}>{column}</Typography>
                        </Paper>
                    </Grid>
                ))}

            </Grid>

                
            {/* Row labels and data cells */}
            {rowLabels.map((row, rowIndex) => (
                <Grid item container spacing={0} key={row}>
                    {/* Row label */}
                    <Grid item xs={2.5 } sm={1} key={row}>
                        <Typography style={{marginTop : '-12px', color : (rowIndex % 2 == 0 ? "inherit" : "transparent"), textAlign : "right", marginRight : "6px"}}>{row}</Typography>
                    </Grid>
                    

                    {/* Data cells */}
                    {columnLabels.map((column, columnIndex) => {
                        const correspondingIndex = rowColToIndex(rowIndex, columnIndex);
                        const isInBounds = cellIsInBounds(correspondingIndex);
                        const correspondingSlot = isInBounds ? availability[correspondingIndex] : new AvailabilitySlot(new Date(Date.now()), false);
                        return (
                            <AvailabilityCell mouseTracker={mouseTracker} slot={correspondingSlot} row={rowIndex} col={columnIndex} inBounds={isInBounds} updateAvailabilityInDB={updateAvailabilityInDB} key={correspondingIndex}/>
                        );
                    })}

                   
                </Grid>
            ))}

        </Grid>
    );
}
