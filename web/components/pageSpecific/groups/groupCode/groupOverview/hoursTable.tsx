import React from "react";

import { Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";
import { useMutationToRemoveMember } from "@/lib/pageSpecific/groupOverviewHooks";
import { Container, Button, Dialog, DialogActions, DialogTitle} from "@mui/material";
import {useContext} from 'react';
import {GroupContext} from '/Users/mayamarkusmalone/Desktop/KVille/web/lib/shared/context/groupContext';
import {UserContext} from '/Users/mayamarkusmalone/Desktop/KVille/web/lib/shared/context/userContext';


interface HoursTableProps {
    hoursPerPerson : {dayHoursPerPerson : {[key : string] : number}, nightHoursPerPerson : {[key : string] : number}} | undefined
}
export const HoursTable : React.FC<HoursTableProps> = (props : HoursTableProps) => {
    const {mutate : removeMember} = useMutationToRemoveMember();
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const {groupDescription} = useContext(GroupContext);
    const {userID} = useContext(UserContext);
    const currentUserIsCreator = groupDescription.creator == userID;
    
    if (typeof props.hoursPerPerson === 'undefined'){
        return null;
    }
    
    let allMembersArr = getAllMembers(props.hoursPerPerson);
    let rows = getRowsForTable(allMembersArr, props.hoursPerPerson);
    
    const handleClickOpen = () => {
        if(currentUserIsCreator){
        setOpen(true);
        } else{
        setOpen2(true);
        }
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleYes = (memberRemove: string) => {
        removeMember({groupCode: groupDescription.groupCode,  usernameOfMemberToRemove: memberRemove});
        setOpen(false);
    };

    const handleClose2 = () => {
        setOpen2(false);
    };

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
                        <TableCell>Remove</TableCell>
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
                        <TableCell >
                            <Button variant="outlined" onClick={() => handleClickOpen()}>
                                Remove Member
                            </Button>
                            <Dialog
                                    open={open}
                                    onClose={handleClose}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">“Are you sure you want to remove {row.member}?</DialogTitle>
                                <DialogActions>
                                    <Button onClick={handleClose}>No</Button>
                                    <Button onClick={() => handleYes(row.member)} autoFocus>Yes</Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog
                                    open={open2}
                                    onClose={handleClose2}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title">
                                Only the group creator can remove members
                                </DialogTitle> 
                                <DialogActions>
                                    <Button onClick={handleClose2}>Ok</Button>  
                                </DialogActions>
                            </Dialog>
                        </TableCell>
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