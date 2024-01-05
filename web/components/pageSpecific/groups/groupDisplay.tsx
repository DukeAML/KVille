import React, { useState, ReactNode, ComponentType } from "react";

import { GroupDescription } from "../../../../common/src/db/groupExistenceAndMembership/groupMembership";
import { useContext } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  makeStyles,
  Input,
} from "@material-ui/core";
import { UserContext } from "@/lib/shared/context/userContext";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { KvilleButton } from "@/components/shared/utils/button";
import { useRouter } from "next/router";

interface GroupDisplayInputInterface {
  group: GroupDescription;
}

export const GroupDisplay: React.FC<GroupDisplayInputInterface> = (
  props: GroupDisplayInputInterface
) => {
  const { groupDescription, setGroupDescription } = useContext(GroupContext);
  const userContext = useContext(UserContext);
  const router = useRouter();

  const handleClick = () => {
    setGroupDescription(props.group);
    router.push("/groups/" + props.group.groupCode);
  };

  return (
    <Container maxWidth="xs">
      <KvilleButton onClick={handleClick} text={props.group.groupName} />
    </Container>
  );
};
