import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer"
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Container, Typography } from "@mui/material";
import React from "react"

const HomePage : React.FC = () => {
	return (
		<BasePageContainerWithNavBarAndTitle title="Welcome to the Shift Scheduling Helper!">
			<Container maxWidth="md">
				<Typography variant="h5" align="center">
					To use our tool, follow the instructions below.
				</Typography>
				<KvilleAccordion elements={[
				{
					summaryText : "1) Everyone in your group will need to register",
					detail : <Typography>Go to the Regsiter page in the Navbar</Typography>
				},
				{
					summaryText : "2) Someone from the group will need to create a group on this site",
					detail : <Typography>Once logged in, go to the My Groups page, and then the Create Group page</Typography>
				},
				{
					summaryText : "3) Everyone else can then join the group",
					detail : <Typography>Once logged in, go to the My Groups page, and then the Join Group page. You'll need the group code from whoever created the group</Typography>
				},
				{
					summaryText : "4) Decide upon a range of dates/times for which you want to assign people to tenting shifts.",
					detail : <Typography>Do this on your own. Often, groups assign members to shifts one week at a time. </Typography>
				},
				{
					summaryText : "5) Then, everyone in the group should fill in their availability on the Availability Page",
					detail : <Typography>Once logged in, go the My Groups Page, select your group, and then go the availability page. You can fill in when you are generally available and also indicate the timeslots for which you would most prefer to be scheduled</Typography>
				},
				{
					summaryText : "6) Finally, run our algorithm to assign people to their shifts",
					detail : <Typography>On the Schedule page, press the Assign Tenters dropdown. Before submitting, make sure everyone has filled in their availability! You can run the algorithm as many times as you want, for whatever time ranges you want. Once completed, you can also swap who is assigned to individual time slots. </Typography>
				}
				]}/>
				<Typography variant="h6" align="center" style={{marginTop : 20}}>
					Done! Repeat Steps 4-6 as needed throughout the tenting season to fill in your schedule
				</Typography>
			</Container>
		</BasePageContainerWithNavBarAndTitle>
	);
}

export default HomePage;