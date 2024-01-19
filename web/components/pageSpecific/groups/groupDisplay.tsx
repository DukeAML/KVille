import React from "react";

import { GroupDescription } from "@/lib/controllers/groupMembershipAndExistence/groupMembershipController";
import { useContext } from "react";
import {Container, Button, Typography, Box} from "@mui/material";
import { GroupContext } from "@/lib/context/groupContext";
import { useRouter } from "next/router";
import { PlayArrow } from "@mui/icons-material";

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
			<Button
				variant="outlined"
				fullWidth
				onClick={handleClick}
				style={{ display: 'flex', justifyContent: 'space-between', textTransform : "none" }}
			>
				<Typography style={{ marginRight: 'auto' }}>
					{props.group.groupName}
				</Typography>
				<PlayArrow/>
			</Button>
		</Container>
	);
};
