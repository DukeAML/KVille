import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Menu, Close } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { makeStyles } from '@material-ui/core';
import { OptionDescription } from './navBar';

interface MobileNavBarProps {
  optionDescriptions: OptionDescription[];
}

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  listItem : {
    marginTop : 12,

  }
}));

export const MobileNavBarDrawerAndMenuIcon: React.FC<MobileNavBarProps> = (props: MobileNavBarProps) => {
  const [openStatus, setOpenStatus] = useState<boolean>(false);
  const router = useRouter();
  const classes = useStyles();

  //below is a hack to set the menu color. Not good coding style
  let color = "white";
  if (props.optionDescriptions.filter((option) => option.text === "Schedule").length > 0){
    color="black";
  }

  return (
    <>
      <IconButton edge="start" className={classes.menuButton} onClick={() => setOpenStatus(true)}>
        <Menu style={{color : color}}/>
      </IconButton>
      <Drawer
        anchor="left"
        open={openStatus}
        className={classes.drawer}
        classes={{ paper: classes.drawerPaper }}
        onClose={() => setOpenStatus(false)}
      >
        <List>
          <ListItem button onClick={() => setOpenStatus(false)}>
            <ListItemIcon>
              <Close style={{color : "red"}}/>
            </ListItemIcon>
            <ListItemText primary="Close" style={{color : "red", marginBottom : 8}} />
          </ListItem>
          {props.optionDescriptions.map((option) => (
            <ListItem button onClick={() => router.push(option.route)} key={option.route} className={classes.listItem}>
         
                <ListItemText primary={option.text} style={{marginLeft : 16}}/>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};
