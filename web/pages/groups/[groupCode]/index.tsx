import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { BasePageContainerForGroupsPage } from "@/components/shared/basePageContainer";
import {fetchHoursPerPerson} from "/Users/mayamarkusmalone/Desktop/KVille/common/src/db/hours.js";
import { useGroupCode } from "/Users/mayamarkusmalone/Desktop/KVille/web/lib/shared/useGroupCode";
import { KvilleLoadingContainer } from "/Users/mayamarkusmalone/Desktop/KVille/web/components/shared/utils/loading";
import { getGroupMembersByGroupCode } from "/Users/mayamarkusmalone/Desktop/KVille/common/src/db/groupExistenceAndMembership/groupMembership.js";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { Typography, Grid, Table, TableBody,TableCell,TableContainer,TableHead,TableRow } from "@material-ui/core";

let rows: { member: string; daytime: number; nighttime: number; total: number; }[] = [];


const GroupHomePage : React.FC = () => {
    const {groupDescription} = useContext(GroupContext);
    const groupCode = useGroupCode();
    const {data, isLoading} = useQuery('fetchingHours' +groupCode, () => fetchHoursPerPerson(groupCode));
    
    function handleRows(member:string, daytime:number, nighttime:number, total:number, ){
        return { member, daytime, nighttime, total};
    }

    async function createRows(){
        if(rows.length ==0){
            let allMembers = await getGroupMembersByGroupCode(groupCode).catch((error) => {throw new Error("HOURS_ERROR_CODES.GROUP_DOES_NOT_EXIST")});
            let allMembersArr = [];
            allMembersArr = allMembers.map((member) => member.username);
    
             if(isLoading == false && data){
    
                for(let i=0;i<allMembersArr.length;i++){
                    const dayHours = data ? data.dayHoursPerPerson[allMembersArr[i]] : null;
                    const nightHours = data ? data.dayHoursPerPerson[allMembersArr[i]] : null;
                    
                    if (typeof dayHours === 'number' && typeof nightHours === 'number') {
                        rows.push(handleRows(allMembersArr[i],dayHours, nightHours, dayHours+nightHours ));
                      }
    
                }
    
            }

        }

    }

    const [isCreateRowsComplete, setIsCreateRowsComplete] = useState(false);
    useEffect(() => {
        async function fetchData() {
            await createRows();
            setIsCreateRowsComplete(true);
          }
      
          fetchData();
      }, [data, isLoading, groupCode]);

    return (
        <BasePageContainerForGroupsPage title={groupDescription.groupName}>
            <Typography>On this page I want to add content for group, including members and their respective hours. I also want the group creator to have the option to remove members. We also need to make the group code visible here</Typography>
            {isLoading ? (
                // Display the loading container while data is being loaded
                <KvilleLoadingContainer />
                ) : (
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
                    {isCreateRowsComplete && rows.map((row) => (
                        <TableRow
                        key={row.member}
                        >
                        <TableCell component="th" scope="row">
                            {row.member}
                        </TableCell>
                        <TableCell align="right">{row.daytime}</TableCell>
                        <TableCell align="right">{row.nighttime}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>)}
        </BasePageContainerForGroupsPage>
    )
}

export default GroupHomePage;