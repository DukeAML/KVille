import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer"
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Container, Typography, Link } from "@mui/material";
import React from "react";
import Image from "next/image";

const HomePage : React.FC = () => {
	return (
		<BasePageContainerWithNavBarAndTitle title="Welcome to the Tent Shift Scheduling Helper!">
			<Container maxWidth="md">
				<Typography variant="h6" align="center" style={{marginBottom : 24, marginTop: 24}}>
					Not sure how to choose who will be in your tent at each time? Spending too much time trying to figure it out? 
					Use our tool to automatically create a fair schedule based on everyone&apos;s availability and preferences! 
					Follow the instructions below
				</Typography>
				<KvilleAccordion elements={[
				{
					summaryText : "1) Everyone in your group will need to register",
					detail : <Typography>Go to the <Link href="/register">Register page</Link> </Typography>
				},
				{
					summaryText : "2) Someone from the group will need to create a group on this site",
					detail : 
					<Container>
						<Typography>
							Once logged in, go to the <Link href="/groups/createGroup" >Create Group page</Link>.
							After creating the group, it will take you to a group overview page (example screenshot below). Note the &quot;group code&quot; on this page. It will also be at the end of the URL. 
							Other people will need this group code to join your group. 
						</Typography>
						<Image src="/Hours_pic.png" alt="Hours" width="600" height="600" style={{marginTop: 24}}/>
					</Container>
				},
				{
					summaryText : "3) Everyone else can then join the group",
					detail : <Typography>Once logged in, go to the <Link href="/groups/joinGroup">Join Group page</Link>. You will need the group code from whoever created the group</Typography>
				},
				{
					summaryText : "4) Decide upon a range of dates/times for which you want to assign people to tenting shifts.",
					detail : <Typography>Do this on your own. Often, groups assign members to shifts one week at a time. </Typography>
				},
				{
					summaryText : "5) Then, everyone in the group should fill in their availability on the Availability Page",
					detail : 
					<Container>
						<Typography>
							Once logged in, go the My Groups Page, select your group, and then go the availability page (screenshot below). 
							You can fill in when you are generally available and also indicate the timeslots for which you would most prefer to be scheduled
						</Typography>
						<Image src="/Availability_pic.png" alt="Availability Page" width="600" height="600"/>
					</Container>
				},
				{
					summaryText : "6) Finally, run our algorithm to assign people to their shifts",
					detail : 
					<Container>
						<Typography>
							On the Schedule page (screenshots below), press the Assign Tenters dropdown. 
							Before submitting, make sure everyone has filled in their availability! 
							You can run the algorithm as many times as you want, for whatever time ranges you want. 
							Once completed, you can also swap who is assigned to individual time slots. 
						</Typography>
						<Image src="/Schedule_pic.png" alt="Schedule Page" width="600" height="600" style={{marginBottom : 24, marginTop : 8}}/>
						<Image src="/Assign_pic.png" alt="Create Schedule" width="600" height="600" style={{marginBottom : 24, marginTop : 8}}/>
						<Image src="/Swap_pic.png" alt="Swap Tenters" width="600" height="600"/>
					</Container>
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