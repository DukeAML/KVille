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
import { KvilleButton } from '@/components/button';




interface GroupDisplayInputInterface {
    group: GroupDescription;
    
}

export const GroupDisplay: React.FC<GroupDisplayInputInterface> = (props:GroupDisplayInputInterface) => {
    const {groupCode, setGroupCode} = useContext(UserContext);
    const userContext = useContext(UserContext);

    const handleClick = () => {
        console.log("trying to set groupCode");
        setGroupCode(props.group.groupCode);

    }

    return (
        
        <Container maxWidth="xs">
            <KvilleButton onClick={handleClick}>
                <Typography>{props.group.groupName}</Typography>
            </KvilleButton>
        </Container>
    
    );
};


