import React, { useContext } from "react";
import { useRouter } from "next/router";
import { BasePageContainerForGroupsPage } from "@/components/basePageContainer";
import { GroupContext } from "@/context/groupContext";
import { Typography } from "@material-ui/core";

const GroupHomePage : React.FC = () => {
    const router = useRouter();
    const {groupDescription} = useContext(GroupContext);


    return (
        <BasePageContainerForGroupsPage title={groupDescription.groupName}>
            <Typography>Add content for group, including members and their respective hours</Typography>
        </BasePageContainerForGroupsPage>
    )
}

export default GroupHomePage;