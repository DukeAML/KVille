import React, { useContext } from "react";
import { BasePageContainerForGroupsPage } from "@/components/shared/basePageContainer";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { Typography } from "@material-ui/core";

const GroupHomePage : React.FC = () => {
    const {groupDescription} = useContext(GroupContext);


    return (
        <BasePageContainerForGroupsPage title={groupDescription.groupName}>
            <Typography>On this page I want to add content for group, including members and their respective hours. I also want the group creator to have the option to remove members. We also need to make the group code visible here</Typography>
        </BasePageContainerForGroupsPage>
    )
}

export default GroupHomePage;