import { useQuery } from "react-query";
import GroupPage from "./index";
import {
  GroupDescription,
  fetchGroups,
} from "../../../common/src/db/groupExistenceAndMembership/groupMembership";
import { useContext } from "react";
import { UserContext } from "@/lib/shared/context/userContext";
import { useRouter } from "next/router";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer";
import { GroupContext } from "@/lib/shared/context/groupContext";

export default function GroupPageFromLogin() {
  //console.log("hi");
  const router = useRouter();
  const { groupDescription, setGroupDescription } = useContext(GroupContext);

  const { userID, isLoggedIn } = useContext(UserContext);

  const {
    data: groups,
    isLoading,
    isError,
  } = useQuery<GroupDescription[], Error>(["fetchAllGroups" + userID], () =>
    fetchGroups(userID)
  );

  if (isLoading) {
    return (
      <BasePageContainerWithNavBarAndTitle title="">
        <KvilleLoadingContainer />
      </BasePageContainerWithNavBarAndTitle>
    );
  }
  if (!isLoading && !isError && groups) {
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
