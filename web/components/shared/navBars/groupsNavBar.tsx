import { KvilleNavBarGivenOptionDescriptions, OptionDescription, DescriptionsToOptions } from "./navBar";
import React, { useContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GroupContext } from "@/lib/context/groupContext";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useCheckIfScreenIsNarrow } from "@/lib/hooks/windowProperties";


export const KvilleGroupsNavBar : React.FC = () => {
    const router = useRouter();
    
    let {groupDescription} = useContext(GroupContext);
    let groupBasePath = "/groups/" + groupDescription.groupCode;
    let optionDescriptions : OptionDescription[] = [

        {text : "Overview", route : groupBasePath},
        {text : "Availability", route : groupBasePath + "/availability"},
        {text : "Schedule", route : groupBasePath + "/schedule"}
    ]

    return (
        <AppBar position="static" color={"transparent"} >
            <Toolbar style={{justifyContent : "left"}}>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    {groupDescription.groupName}
                </Typography>
                {DescriptionsToOptions(optionDescriptions, router)}
            </Toolbar>
        </AppBar>
    )
}

