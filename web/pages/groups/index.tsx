import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { UserContext } from "@/lib/context/userContext";
import { Container, Typography} from "@mui/material";
import { Button } from "@material-ui/core";
import { useContext } from "react";
import { useQuery } from "react-query";
import {
  fetchGroups,
} from "@/lib/db/groupExistenceAndMembership/groupMembership";
import { fetchGroupsThroughAPI } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { GroupDescription } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { GroupDisplay } from "../../components/pageSpecific/groups/groupDisplay";
import {
  KvilleLoadingContainer,
} from "@/components/shared/utils/loading";
import { KvilleButton } from "@/components/shared/utils/button";
import { useRouter } from "@/../next/router";
import Stack from "@mui/material/Stack";
import { ErrorMessage } from "@/components/shared/utils/errorMessage";

export default function GroupPage() {
	const { userID, isLoggedIn } = useContext(UserContext);
	const {
		data: groups,
		isLoading,
		isError,
	} = useQuery<GroupDescription[], Error>(["fetchAllGroups" + userID], () =>
		fetchGroupsThroughAPI()
	);
	const router = useRouter();

	let body = null;
	if (isLoading) {
		body = <KvilleLoadingContainer />;
	} else if (isError) {
		body=<Container><ErrorMessage msg="An error occurred"/></Container>
	} else if (groups) {
		body = (
		<Container maxWidth="sm">
			<Typography variant="h6" align="center" style={{marginBottom : 16}}>
				{groups.length > 0 ? "Select your Group or Join/Create one to Continue." : "You are not a member of a group yet. Join or create one to continue"}
			</Typography>
			{groups?.map((group, index) => {
				return <GroupDisplay group={group} key={index} />;
			})}
			<Stack direction="column" alignItems="center" gap={1} style={{marginTop : 16}}>
				<Button
					onClick={() => router.push("/groups/joinGroup")}
					variant="contained"
					color="primary"
					style={{textTransform : "none"}}
				>Join a Group</Button>
				<Button
					onClick={() => router.push("/groups/createGroup")}
					variant="contained"
					color="primary"
					style={{textTransform : "none"}}
				>Create a Group</Button>
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
