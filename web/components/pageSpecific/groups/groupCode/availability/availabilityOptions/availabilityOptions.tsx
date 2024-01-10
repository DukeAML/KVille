import React, {useContext} from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography, Container, Button, List, ListItem, Switch, FormControlLabel, Stack } from "@mui/material";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import { AvailabilityPageContext } from '@/lib/context/AvailabilityPageContextType';
import { KvilleButton } from "@/components/shared/utils/button";
import { AvailabilityDatesRangeChanger } from "./availabilityDatesRangeChanger";


export const AvailabilityOptions : React.FC = () => {
    const {calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate, settingPreferred, setSettingPreferred, colorblindModeIsOn, setColorblindModeIsOn } = useContext(AvailabilityPageContext);
    let changeTimesOption = {
        summaryText : "Change Dates Visible",
        detail : <AvailabilityDatesRangeChanger/>
    }

    let changeSettingPreferredOption = {
        summaryText : "Set Most Preferred Timeslots",
        detail : <Container>
            {settingPreferred ? 
                <Typography style={{marginBottom : 8}}>You are now setting your preferred availability slots. Our algorithm will specifically try to put you in the slots you mark as preferred.</Typography> 
                : 
                <Typography style={{marginBottom : 8}}>You are now setting basic availability slots. Our algorithm could assign you to any slot you mark as available, but you can press the button below to mark your preferred timeslots. Our algorithm will prioritize assigning you to your preferred slots moreso than your standard available slots </Typography>
            }
            <Stack direction="column" gap={1}>
                <Button disabled={settingPreferred} variant="contained" onClick={() => setSettingPreferred(true)} style={{maxWidth : "fit-content"}} >
                    Set Preferred Times
                </Button>
                <Button disabled={!settingPreferred} variant="contained" onClick={() => setSettingPreferred(false)} style={{maxWidth : "fit-content"}}>
                    Set Standard Availability Times
                </Button>
            </Stack>
        </Container>
    }

    let colorCodesOption = {
        summaryText : "Color Codes",
        detail : <Container>
            <Typography>
                You can choose to display the availability at each time slot with color-coded cells, or by having text in each cell. 
            </Typography>
            <KvilleButton text={colorblindModeIsOn ? "Use colors to denote status" : "Use text to denote status"}
                onClick={() => {
                    if (colorblindModeIsOn){
                        setColorblindModeIsOn(false);
                    } else {
                        setColorblindModeIsOn(true);
                    }
                }}/>
                

            <List sx={{ listStyleType: 'disc' }}>
                <ListItem sx={{ display: 'list-item' }}>
                    {colorblindModeIsOn ? "\"a\" (for \"available\")" : "Green"} represents when you are available. Our scheduling algorithm can assign you to any timeslot shown here as {colorblindModeIsOn ? "\"a\" or \"p\"" : "green or gold"}
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                    {colorblindModeIsOn ? "\"u\" (\"for \"unavailable\")" : "Red"} represents when you are unavailable. Our scheduling algorithm will not assign to you a time when you are unavailable
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                    {colorblindModeIsOn ? "\"p\" (\"for \"preferred\")" : "Gold"} is for the timeslots you most want to be in. Our scheduling algorithm will make it a priority to assign you to these times when possible. Check the &quot;Set Most Preferred Timeslots&quot; dropdown above for more details
                </ListItem>
                <ListItem sx={{display : 'list-item'}}>
                    {colorblindModeIsOn ? "\"x\" (for out of bounds)" : "Gray"} is for timeslots which fall outside of the time period where your group has to be in the tent
                </ListItem>
            </List>
        </Container>
    }
    
    return (
        <Container maxWidth="sm">
            <KvilleAccordion elements={[changeTimesOption, changeSettingPreferredOption, colorCodesOption]}/>
        </Container>
    );
}