import React, { useState, ReactNode, ComponentType } from 'react';

import {GroupDescription} from "../../../common/db/groupMembership";
import { useContext } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  makeStyles,
  Input,
} from '@material-ui/core';
import { UserContext } from '@/context/userContext';
import { GroupContext } from '@/context/groupContext';
import { KvilleButton } from '@/components/utils/button';
import { useRouter } from 'next/router';




interface GroupDisplayInputInterface {
    group: GroupDescription;
    
}

export const GroupDisplay: React.FC<GroupDisplayInputInterface> = (props:GroupDisplayInputInterface) => {
    const {groupDescription, setGroupDescription} = useContext(GroupContext);
    const userContext = useContext(UserContext);
    const router = useRouter();


    const handleClick = () => {
        console.log("trying to set group description");
        setGroupDescription(props.group);
        router.push("groups/" + props.group.groupCode);

    }

    return (
        
        <Container maxWidth="xs">
            <KvilleButton onClick={handleClick}>
                <Typography>{props.group.groupName}</Typography>
            </KvilleButton>
        </Container>
    
    );
};


