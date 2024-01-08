import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer"
import { KvilleButton } from "@/components/shared/utils/button";
import { Container, Typography, Button, Stack } from "@mui/material";
import {signOut} from "firebase/auth";
import { auth } from "@/lib/db/firebase_config";
import { useRouter } from "next/router";
import React, {useState} from "react"

const HomePage : React.FC = () => {
    const router = useRouter();
    const [error, setError] = useState<boolean>(false);
    const signUserOut = async () => {
        try{
            await signOut(auth);
            router.push("/login");            
        } catch {
            setError(true);
        }
    }

	return (
		<BasePageContainerWithNavBarAndTitle title="Sign Out">
			<Container maxWidth="sm">
                <Stack>
                    <Typography variant="h6" align="center" style={{marginBottom : 16}}>
                        Are you sure you want to sign out?
                    </Typography>
                    <Button variant="contained" color="primary" onClick={signUserOut} >Yes, sign me out</Button>
                </Stack>
                {error ? 
                    <Typography align="center" color="red" >
                        An unknown error occurred
                    </Typography>
                    : null
                }
                <Typography >

                </Typography>
			</Container>
		</BasePageContainerWithNavBarAndTitle>
	);
}


export default HomePage;