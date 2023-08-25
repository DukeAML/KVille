import { CircularProgress, Container } from "@mui/material";
import React from "react";

interface KvilleLoadingCircleProps {

}
export const KvilleLoadingCircle : React.FC<KvilleLoadingCircleProps> = (props : KvilleLoadingCircleProps) => {
    return <CircularProgress style={{margin : '0 auto'}} />

}

interface KvilleLoadingContainerProps {
    
}
export const KvilleLoadingContainer : React.FC<KvilleLoadingContainerProps> = (props: KvilleLoadingContainerProps) => {
    return (
        <Container maxWidth="sm" style={{display : "flex", alignItems: "center", justifyContent: "center"}}>
            <KvilleLoadingCircle/>
        </Container>
    )
}