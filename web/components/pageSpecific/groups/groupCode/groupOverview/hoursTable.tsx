import React from "react";

import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";
import { useMutationToRemoveMember } from "@/lib/pageSpecific/groupOverviewHooks";
import { useQueryToFetchSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { EMPTY } from "../../../../../../common/src/scheduling/slots/tenterSlot";
import { Container, Dialog, DialogActions, DialogTitle, Typography} from "@mui/material";
import {Button} from "@material-ui/core";
import {useContext} from 'react';
import {GroupContext} from '@/lib/shared/context/groupContext';
import {UserContext} from '@/lib/shared/context/userContext';
import { RemoveMemberPrompt } from "./removeMemberPrompt";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { ScheduleAndStartDate } from "../../../../../../common/src/db/schedule/scheduleAndStartDate";

interface HoursTableProps {
    schedule : ScheduleAndStartDate;
}
export const HoursTable : React.FC<HoursTableProps> = (props : HoursTableProps) => {
    const groupCode = useGroupCode();
    const {data : schedule} = useQueryToFetchSchedule(groupCode);
    const {groupDescription} = useContext(GroupContext);
    const {userID} = useContext(UserContext);
    const currentUserIsCreator = groupDescription.creator == userID;

    
    if (typeof props.schedule === 'undefined'){
        return null;
    }
    
    let allMembersArr = getAllMembers(props.schedule);

    let rows = getRowsForTable(allMembersArr, props.schedule.getHoursPerPersonWholeSchedule());
    
    return (
        <Container maxWidth="sm">
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Member Name</Typography></TableCell>
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Daytime Hours</Typography></TableCell>
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Nighttime Hours</Typography></TableCell>
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Total</Typography></TableCell>
                            { currentUserIsCreator ? 
                                <TableCell style={{width : 200}}><Typography style={{fontWeight : 'bold'}}>Remove</Typography></TableCell>
                                : 
                                null
                            }
                            
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                            key={row.member}
                            >
                                <TableCell component="th" scope="row">
                                    {row.member}
                                </TableCell>
                                <TableCell >{row.daytime}</TableCell>
                                <TableCell >{row.nighttime}</TableCell>
                                <TableCell >{row.total}</TableCell>
                                {(currentUserIsCreator && schedule && (schedule.IDToNameMap.get(userID) !== row.member)) ?
                                    <TableCell >
                                        <RemoveMemberPrompt memberUsername={row.member}/>
                                    </TableCell> 
                                    : 
                                    null
                                }
                                
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );

}

const getAllMembers = (schedule : ScheduleAndStartDate) : string[] =>  {
    return schedule.getAllMembers().map((member) => member.username);
}

interface DataForTableRow {
    member : string,
    daytime : number,
    nighttime : number,
    total : number
}
const getRowsForTable = (allMembersArr : string[], hoursPerPerson : {dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}) : DataForTableRow[] => {
    let rows = [];
    for(let memberIndex=0;memberIndex<allMembersArr.length;memberIndex++){
        if (allMembersArr[memberIndex] === EMPTY){
            continue;
        }
        const dayHours = hoursPerPerson.dayHoursPerPerson[allMembersArr[memberIndex]];
        const nightHours = hoursPerPerson.nightHoursPerPerson[allMembersArr[memberIndex]];
        const totalHours = dayHours + nightHours;
        
        if (typeof dayHours === 'number' && typeof nightHours === 'number') {
            rows.push({member : allMembersArr[memberIndex], daytime : dayHours, nighttime : nightHours, total : totalHours});
          }

    }
    return rows;
}