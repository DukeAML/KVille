import { setDBAvailabilityThroughAPI } from "@/lib/controllers/availabilityController";
import { AvailabilitySlot } from "@/lib/controllers/availabilityController";
import {getCalendarColumnTitles, get48TimeLabels} from '@/lib/calendarAndDatesUtils/calendarUtils';
import { getNumSlotsBetweenDates } from '@/lib/calendarAndDatesUtils/datesUtils';
import { Grid, Typography } from '@mui/material';
import { AvailabilityCell } from './availabilityCell';
import {MouseTracker} from '@/lib/calendarAndDatesUtils/availability/mouseTracker';
import { useEffect, useState, useContext } from 'react';
import { AvailabilityPageContext } from '@/lib/context/AvailabilityPageContextType';
import { UserContext } from '@/lib/context/userContext';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import { getQueryKeyNameForFetchAvailability } from '@/lib/hooks/availabilityHooks';
import { useCheckIfScreenIsNarrow } from '@/lib/hooks/windowProperties';
import { AvailabilityGridColumnTitles } from './availabilityGridColumnTitles';

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
    const [edited, setEdited] = useState<boolean[]>(new Array(props.originalAvailabilityArr.length).fill(false));
    
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
        setDBAvailabilityThroughAPI(groupCode, newAvailabilitySlots);
        setEdited(new Array(props.originalAvailabilityArr.length).fill(false));
    }

    const changeBasicAvailabilityAtRowsAndCols = (rowsAndCols : RowAndCol[], newValue : boolean, valueChangedToOnDragStart : boolean) => {
        let newAvailability = [...availability];
        for (let i = 0; i < rowsAndCols.length; i += 1){
            let row = rowsAndCols[i].row;
            let col = rowsAndCols[i].col;
            let index = rowColToIndex(row, col);
            if (index >= 0 && index < newAvailability.length && !(valueChangedToOnDragStart == newAvailability[index].available && !edited[index])){
                if (newValue == false){
                    newAvailability[index].available = false;
                    newAvailability[index].preferred = false;
                } else {
                    newAvailability[index].available = true;
                }
                edited[index] = true;
            }
        }
        setAvailability(newAvailability);
    }

    const changePreferredAvailabilityAtRowsAndCols = (rowsAndCols : RowAndCol[], newValue : boolean, valueChangedToOnDragStart : boolean) => {
        let newAvailability = [...availability];
        for (let i = 0; i < rowsAndCols.length; i += 1){
            let row = rowsAndCols[i].row;
            let col = rowsAndCols[i].col;
            let index = rowColToIndex(row, col);
            if (index >= 0 && index < newAvailability.length && !(valueChangedToOnDragStart == newAvailability[index].preferred && !edited[index])){
                if (newValue == false){
                    newAvailability[index].preferred = false;
                } else {
                    newAvailability[index].available = true;
                    newAvailability[index].preferred = true;
                } 
                edited[index] = true;
            }
        }
        setAvailability(newAvailability);
    }

    useEffect(() => {
        if (settingPreferred){
            mouseTracker.setChangeAvailabilityAtRowsAndCols(changePreferredAvailabilityAtRowsAndCols);
        } else {
            mouseTracker.setChangeAvailabilityAtRowsAndCols(changeBasicAvailabilityAtRowsAndCols);
        }
    });

    let columnTitles = getCalendarColumnTitles(calendarStartDate, calendarEndDate, isNarrow);
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
        <Grid container spacing={0} direction="column" style={{marginTop : "20px", marginBottom : 20}}>
            <AvailabilityGridColumnTitles columnTitles={columnTitles}/>
            {/* Row labels and data cells */}
            {rowLabels.map((row, rowIndex) => (
                <Grid item container spacing={0} key={row}>
                    {/* Row label */}
                    <Grid item xs={2.5 } sm={1} key={row + "label"}>
                        <Typography style={{marginTop : '-12px', color : (rowIndex % 2 == 0 ? "inherit" : "transparent"), textAlign : "right", marginRight : "6px", userSelect: "none"}}>{row}</Typography>
                    </Grid>
                    {/* Data cells */}
                    {columnTitles.map((column, columnIndex) => {
                        const correspondingIndex = rowColToIndex(rowIndex, columnIndex);
                        const isInBounds = cellIsInBounds(correspondingIndex);
                        const correspondingSlot = isInBounds ? availability[correspondingIndex] : new AvailabilitySlot(new Date(Date.now()), false);
                        return (
                            <AvailabilityCell mouseTracker={mouseTracker} slot={correspondingSlot} row={rowIndex} col={columnIndex} inBounds={isInBounds} updateAvailabilityInDB={updateAvailabilityInDB} key={correspondingIndex}/>
                        );
                    })}

                    {/* Right side labels, if screen is wide */}
                    {isNarrow ? null : 
                        <Grid item xs={2.5 } sm={1} key={row}>
                            <Typography style={{marginTop : '-12px', color : (rowIndex % 2 == 0 ? "inherit" : "transparent"), textAlign : "left", marginLeft : "6px", userSelect: "none"}}>{row}</Typography>
                        </Grid>
                    }
                </Grid>
            ))}

            <AvailabilityGridColumnTitles columnTitles={columnTitles}/>
        </Grid>
    );
}
