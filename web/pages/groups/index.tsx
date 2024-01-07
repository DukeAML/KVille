import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { UserContext } from "@/lib/context/userContext";
import { Container, Typography, Button } from "@mui/material";
import { useContext } from "react";
import { useQuery } from "react-query";
import {
  fetchGroups,
  GroupDescription,
} from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { GroupDisplay } from "../../components/pageSpecific/groups/groupDisplay";
import {
  KvilleLoadingContainer,
} from "@/components/shared/utils/loading";
import { KvilleButton } from "@/components/shared/utils/button";
import { useRouter } from "@/../next/router";
import Stack from "@mui/material/Stack";

export default function GroupPage() {
	const { userID, isLoggedIn } = useContext(UserContext);
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
			{groups?.map((group, index) => {
				return <GroupDisplay group={group} key={index} />;
			})}
			<Stack direction="column" alignItems="center" gap={1}>
				<Button
					onClick={() => router.push("/groups/joinGroup")}
					variant="outlined"
				>Join A Group</Button>
				<Button
					onClick={() => router.push("/groups/createGroup")}
					variant="outlined"
				>Create A Group</Button>
			</Stack>
		</Container>
		);
	}
	return (
		<PermissionRequiredPageContainer title="My Groups" groupSpecificPage={false}>
			{body}
		</PermissionRequiredPageContainer>
	);
}
