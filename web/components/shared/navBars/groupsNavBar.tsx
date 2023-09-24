import { KvilleNavBarGivenButtonDescriptions, ButtonDescription } from "./navBar";
import React, { useContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { getWindowProperties, useCheckIfScreenIsNarrow } from "@/lib/shared/windowProperties";


export const KvilleGroupsNavBar : React.FC = () => {
    const router = useRouter();
    
    let {groupDescription} = useContext(GroupContext);
    let groupBasePath = "/groups/" + groupDescription.groupCode;
    let buttonDescriptions : ButtonDescription[] = [

        {text : "Overview", route : groupBasePath},
        {text : "Availability", route : groupBasePath + "/availability"},
        {text : "Schedule", route : groupBasePath + "/schedule"}
    ]

    const {isNarrow, checkingIfNarrow} = useCheckIfScreenIsNarrow();

    return (
        <AppBar position="static" color={"transparent"} >
            <Toolbar style={{justifyContent : "left"}}>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    {groupDescription.groupName}
                </Typography>

      
                {buttonDescriptions.map((description, index) => {
                    return (
                        <Button color="inherit" onClick={() => router.push(description.route)} key={index}>{description.text}</Button>
                    )
                })}
            </Toolbar>
        </AppBar>
    )
}

