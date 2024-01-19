import { useQuery } from "react-query";
import GroupPage from "./index";
import {
  fetchGroups,
} from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { fetchGroupsThroughAPI } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { GroupDescription } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { useContext } from "react";
import { UserContext } from "@/lib/context/userContext";
import { useRouter } from "next/router";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer";
import { GroupContext } from "@/lib/context/groupContext";
import { Container } from "@mui/material";

export default function GroupPageFromLogin() {
  const router = useRouter();
  const { setGroupDescription } = useContext(GroupContext);

  const { userID } = useContext(UserContext);

  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery<GroupDescription[], Error>(["fetchAllGroups" + userID], () =>
    fetchGroupsThroughAPI()
  );

  if (isLoading) {
    return (
      <BasePageContainerWithNavBarAndTitle title="">
        <KvilleLoadingContainer />
      </BasePageContainerWithNavBarAndTitle>
    );
  } else if (isError) {
    return (
      <BasePageContainerWithNavBarAndTitle title="An error occurred">
        
      </BasePageContainerWithNavBarAndTitle>
    )

  } else if (groups) {
    if (groups.length == 1) {
      setGroupDescription(groups[0]);
      router.push("/groups/" + groups[0].groupCode);
      return (
        <BasePageContainerWithNavBarAndTitle title="">
          <KvilleLoadingContainer />
        </BasePageContainerWithNavBarAndTitle>
      );
    }
    
  }
  return <GroupPage />;
}
