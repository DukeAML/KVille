import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/basePageContainer"
import { Container, Typography } from "@mui/material";
import React from "react"

const HomePage : React.FC = () => {
  return (
    <BasePageContainerWithNavBarAndTitle title="Welcome to Kville">
        <Container>
          <Typography variant="h5" align="center">I want to add a little blurb about the site, plus buttons to login and register, plus some pics to show off the functionality</Typography>
        </Container>
    </BasePageContainerWithNavBarAndTitle>
  );
}

export default HomePage;