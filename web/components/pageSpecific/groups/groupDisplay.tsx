import React from "react";

import { GroupDescription } from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { useContext } from "react";
import {Container} from "@material-ui/core";
import { GroupContext } from "@/lib/context/groupContext";
import { KvilleButton } from "@/components/shared/utils/button";
import { useRouter } from "next/router";

interface GroupDisplayInputInterface {
  group: GroupDescription;
}

export const GroupDisplay: React.FC<GroupDisplayInputInterface> = (props: GroupDisplayInputInterface) => {
  const { groupDescription, setGroupDescription } = useContext(GroupContext);
  const router = useRouter();

  const handleClick = () => {
    setGroupDescription(props.group);
    router.push("/groups/" + props.group.groupCode);
  };

  return (
    <Container maxWidth="xs" style={{marginBottom : 4}}>
      <KvilleButton onClick={handleClick} text={props.group.groupName} />
    </Container>
  );
};
