import React from "react";

import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";
import { useMutationToRemoveMember } from "@/lib/hooks/groupOverviewHooks";
import { useQueryToFetchSchedule } from "@/lib/hooks/scheduleHooks";
import { EMPTY } from "@/lib/schedulingAlgo/slots/tenterSlot";
import { Container, Dialog, DialogActions, DialogTitle, Typography} from "@mui/material";
import {Button} from "@material-ui/core";
import {useContext} from 'react';
import {GroupContext} from '@/lib/context/groupContext';
import {UserContext} from '@/lib/context/userContext';
import { RemoveMemberPrompt } from "./removeMemberPrompt";
import { useGroupCode } from "@/lib/hooks/useGroupCode";
import { ScheduleData } from "@/lib/controllers/scheduleData";
import { DiscretionaryGraceContext } from "@/lib/context/discretionaryContext";

interface HoursTableProps {
    schedule : ScheduleData;
}
export const HoursTable : React.FC<HoursTableProps> = (props : HoursTableProps) => {
    const groupCode = useGroupCode();
    const {data : schedule} = useQueryToFetchSchedule(groupCode);
    const {groupDescription} = useContext(GroupContext);
    const {userID} = useContext(UserContext);
    const {showingDiscretionaryGrace, setShowingDiscretionaryGrace} = useContext(DiscretionaryGraceContext);
    const currentUserIsCreator = groupDescription.creator == userID;


    
    if (typeof props.schedule === 'undefined'){
        return null;
    }
    
    let allMembersArr = getAllMembers(props.schedule);

    let rows = getRowsForTable(allMembersArr, props.schedule.getHoursPerPersonWholeSchedule(), props.schedule.getHoursPerPersonWholeScheduleAccountingForDiscretionaryGrace());
    
    return (
        <Container maxWidth={showingDiscretionaryGrace ? "md" : "sm"}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Member Name</Typography></TableCell>
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Daytime Hours</Typography></TableCell>
                            {showingDiscretionaryGrace ? <TableCell><Typography style={{fontWeight : 'bold'}}>Daytime Hours Without Grace</Typography></TableCell> : null}
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Nighttime Hours</Typography></TableCell>
                            {showingDiscretionaryGrace ? <TableCell><Typography style={{fontWeight : 'bold'}}>Nighttime Hours Without Grace</Typography></TableCell> : null}
                            <TableCell><Typography style={{fontWeight : 'bold'}}>Total</Typography></TableCell>
                            {showingDiscretionaryGrace ? <TableCell><Typography style={{fontWeight : 'bold'}}>Total Hours Without Grace</Typography></TableCell> : null}
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
                                {showingDiscretionaryGrace ? <TableCell>{row.daytimeWithoutGrace}</TableCell> : null}
                                <TableCell >{row.nighttime}</TableCell>
                                {showingDiscretionaryGrace ? <TableCell>{row.nighttimeWithoutGrace}</TableCell> : null}
                                <TableCell >{row.total}</TableCell>
                                {showingDiscretionaryGrace ? <TableCell>{row.totalWithoutGrace}</TableCell> : null}
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

const getAllMembers = (schedule : ScheduleData) : string[] =>  {
    return schedule.getAllMembers().map((member) => member.username);
}

interface DataForTableRow {
    member : string,
    daytime : number,
    nighttime : number,
    total : number,
    daytimeWithoutGrace : number,
    nighttimeWithoutGrace : number,
    totalWithoutGrace : number
}

interface HoursPerPerson{
    dayHoursPerPerson : {[key : string] : number};
    nightHoursPerPerson : {[key : string] : number};
}
const getRowsForTable = (allMembersArr : string[], hoursPerPerson : HoursPerPerson, hoursPerPersonWithoutGrace : HoursPerPerson): DataForTableRow[] => {
    let rows = [];
    for(let memberIndex=0;memberIndex<allMembersArr.length;memberIndex++){
        if (allMembersArr[memberIndex] === EMPTY){
            continue;
        }
        let name = allMembersArr[memberIndex];
        const daytime = hoursPerPerson.dayHoursPerPerson[name];
        const nighttime = hoursPerPerson.nightHoursPerPerson[name];
        const total = daytime + nighttime;
        const daytimeWithoutGrace = hoursPerPersonWithoutGrace.dayHoursPerPerson[name];
        const nighttimeWithoutGrace = hoursPerPersonWithoutGrace.nightHoursPerPerson[name];
        const totalWithoutGrace = daytimeWithoutGrace + nighttimeWithoutGrace;
        
        if (typeof daytime === 'number' && typeof nighttime === 'number') {
            rows.push({member : allMembersArr[memberIndex], daytime, nighttime, total, daytimeWithoutGrace, nighttimeWithoutGrace, totalWithoutGrace});
          }

    }
    return rows;
}