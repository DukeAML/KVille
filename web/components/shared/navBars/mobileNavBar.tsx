import { OptionDescription, KvilleNavBarGivenOptionDescriptions } from "./navBar";
import React, {useState} from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Menu, Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useRouter } from "next/dist/client/router";


interface MobileNavBarProps {
    optionDescriptions : OptionDescription[];
}

export const MobileNavBarDrawerAndMenuIcon : React.FC<MobileNavBarProps> = (props : MobileNavBarProps) => {
    const [openStatus, setOpenStatus] = useState<boolean>(false);
    const router = useRouter();

    return (
        <>
            <IconButton edge="start" onClick={() => setOpenStatus(true)}>
                <Menu/>
            </IconButton>
            <Drawer anchor="left" open={openStatus}>
                <List>
                    <ListItem button onClick={() => setOpenStatus(false)}>
                        <ListItemIcon>
                            <Close/>
                        </ListItemIcon>
                        <ListItemText primary="Close" />
                    </ListItem>
                    {props.optionDescriptions.map((option) => 
                        <ListItem button onClick={() => router.push(option.route)} key={option.route}>
                            <ListItemText primary={option.text}/>
                        </ListItem>
                    )}
                </List>
            </Drawer>
        </>
      );
}

