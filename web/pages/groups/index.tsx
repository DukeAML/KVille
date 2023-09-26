import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer";
import { UserContext } from "@/lib/shared/context/userContext";
import { Container, Typography } from "@material-ui/core";
import { Component, useContext } from "react";
import { useQuery } from "react-query";
import {
  fetchGroups,
  GroupDescription,
} from "../../../common/src/db/groupExistenceAndMembership/groupMembership";
import { GroupDisplay } from "../../components/pageSpecific/groups/groupDisplay";
import {
  KvilleLoadingCircle,
  KvilleLoadingContainer,
} from "@/components/shared/utils/loading";
import { KvilleButton } from "@/components/shared/utils/button";
import { useRouter } from "@/../next/router";
import { Box } from "@material-ui/core";
import Stack from "@mui/material/Stack";

export default function GroupPage() {
  const { userID, isLoggedIn } = useContext(UserContext);
  console.log("rendering groups home page and my userID is " + userID);
  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery<GroupDescription[], Error>(["fetchAllGroups" + userID], () =>
    fetchGroups(userID)
  );
  const router = useRouter();

  let body = null;
  if (isLoading) {
    body = <KvilleLoadingContainer />;
  } else {
    body = (
      <Container maxWidth="sm">
        <Typography variant="h6" align="center">
          Select your Group or Join/Create one to Continue.
        </Typography>
        <Typography align="center">My Group</Typography>
        {groups?.map((group, index) => {
          return <GroupDisplay group={group} key={index} />;
        })}
        <Stack direction="row" alignItems="center" gap={1}>
          <KvilleButton
            onClick={() => router.push("/groups/joinGroup")}
            text="Join Group"
          ></KvilleButton>
          <KvilleButton
            onClick={() => router.push("/groups/createGroup")}
            text="Create Group"
          ></KvilleButton>
        </Stack>
      </Container>
    );
  }
  return (
    <BasePageContainerWithNavBarAndTitle title="Group Membership">
      {body}
    </BasePageContainerWithNavBarAndTitle>
  );
}
