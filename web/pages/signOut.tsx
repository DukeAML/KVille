import { BasePageContainerWithNavBarAndTitle } from "@/components/shared/pageContainers/basePageContainer"
import { KvilleButton } from "@/components/shared/utils/button";
import { Container, Typography } from "@mui/material";
import {signOut} from "firebase/auth";
import { auth } from "../../common/src/db/firebase_config";
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
                <Typography variant="h5" align="center">
                    Are you sure you want to sign out?
                </Typography>
                <KvilleButton text="Yes, sign me out" onClick={signUserOut} />
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