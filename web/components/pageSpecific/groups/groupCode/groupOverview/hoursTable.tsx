import React from "react";

import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";
import { Container } from "@mui/material";

interface HoursTableProps {
    hoursPerPerson : {dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}} | undefined
}
export const HoursTable : React.FC<HoursTableProps> = (props : HoursTableProps) => {
    if (typeof props.hoursPerPerson === 'undefined'){
        return null;
    }
    
    let allMembersArr = getAllMembers(props.hoursPerPerson);
    let rows = getRowsForTable(allMembersArr, props.hoursPerPerson);
    
    return (
        <Container maxWidth="sm">
            <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>Member Name</TableCell>
                        <TableCell>Daytime Hours</TableCell>
                        <TableCell>Nighttime Hours</TableCell>
                        <TableCell>Total Hours</TableCell>
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
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );

}

const getAllMembers = (hoursPerPerson : {dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}) : string[] =>  {
    let allMembersArr : string[] = [];
    for (let member in hoursPerPerson.dayHoursPerPerson){
        allMembersArr.push(member);
    }
    for (let member in hoursPerPerson.nightHoursPerPerson){
        if (!allMembersArr.includes(member)){
            allMembersArr.push(member);
        }
    }
    return allMembersArr;
}

interface DataForTableRow {
    member : string,
    daytime : number,
    nighttime : number,
    total : number
}
const getRowsForTable = (allMembersArr : string[], hoursPerPerson : {dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}}) : DataForTableRow[] => {
    let rows = [];
    for(let i=0;i<allMembersArr.length;i++){
        const dayHours = hoursPerPerson.dayHoursPerPerson[allMembersArr[i]];
        const nightHours = hoursPerPerson.nightHoursPerPerson[allMembersArr[i]];
        const totalHours = dayHours + nightHours;
        
        if (typeof dayHours === 'number' && typeof nightHours === 'number') {
            rows.push({member : allMembersArr[i], daytime : dayHours, nighttime : nightHours, total : totalHours});
          }

    }
    return rows;
}