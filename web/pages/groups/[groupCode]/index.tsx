import React from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { Typography, Container } from '@mui/material'
import { HoursTable } from "@/components/pageSpecific/groups/groupCode/groupOverview/hoursTable";
import { EditableGroupName } from "@/components/pageSpecific/groups/groupCode/groupOverview/editableGroupName";
import { useQueryToFetchHoursTableData } from "@/lib/pageSpecific/groupOverviewHooks";

const GroupHomePage : React.FC = () => {    

    const groupCode = useGroupCode();
    const {data, isLoading} = useQueryToFetchHoursTableData(groupCode);
    
    return (
        <PermissionRequiredPageContainer title={"Group Overview"} groupSpecificPage={true}>
            <EditableGroupName/>
            <Container maxWidth="md">
                <Typography align="left" style={{marginTop : 16, marginBottom : 16}}>
                    Here are your group members, along with how many hours they are scheduled for. Other people can join your group through the Join Group page, with group Code {groupCode}
                </Typography>
            </Container>
            {isLoading ? (
                // Display the loading container while data is being loaded
                <KvilleLoadingContainer />
            ) : <HoursTable hoursPerPerson={data}/>}
        </PermissionRequiredPageContainer>
    );
}


export default GroupHomePage;