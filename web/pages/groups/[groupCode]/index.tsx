import React from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { Typography } from '@material-ui/core';
import { HoursTable } from "@/components/pageSpecific/groups/groupCode/groupOverview/hoursTable";
import { EditableGroupName } from "@/components/pageSpecific/groups/groupCode/groupOverview/editableGroupName";
import { useQueryToFetchHoursTableData } from "@/lib/pageSpecific/groupOverviewHooks";

const GroupHomePage : React.FC = () => {    

    const groupCode = useGroupCode();
    const {data, isLoading} = useQueryToFetchHoursTableData(groupCode);
    
    return (
        <PermissionRequiredPageContainer title={"Group Overview"} groupSpecificPage={true}>
            <EditableGroupName/>    
            <Typography>On this page I want to add content for group, including members and their respective hours. I also want the group creator to have the option to remove members. We also need to make the group code visible here</Typography>
            {isLoading ? (
                // Display the loading container while data is being loaded
                <KvilleLoadingContainer />
            ) : <HoursTable hoursPerPerson={data}/>}
        </PermissionRequiredPageContainer>
    );
}


export default GroupHomePage;