import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer"
import { Container, Typography } from "@mui/material";
import React from "react"

const HomePage : React.FC = () => {
	return (
		<BasePageContainerWithNavBarAndTitle title="Welcome to Kville">
			<Container>
			<Typography variant="h5" align="center">
				On this page I want to add a little blurb about the site, plus buttons to go to login and register pages, 
				plus some pics to show people what our site offers
			</Typography>
			</Container>
		</BasePageContainerWithNavBarAndTitle>
	);
}

export default HomePage;