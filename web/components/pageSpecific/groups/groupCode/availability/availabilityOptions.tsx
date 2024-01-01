import React, {useContext} from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography, Container, Button, List, ListItem, Switch, FormControlLabel } from "@mui/material";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import { AvailabilityPageContext } from '@/lib/pageSpecific/availability/AvailabilityPageContextType';
import { KvilleButton } from "@/components/shared/utils/button";


export const AvailabilityOptions : React.FC = () => {
    const {calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate, settingPreferred, setSettingPreferred, colorblindModeIsOn, setColorblindModeIsOn } = useContext(AvailabilityPageContext);
    let changeTimesOption = {
        summaryText : "Change Dates Visible",
        detail : 
            <DateRangeChanger includeHours={false}
                externalStartDate={calendarStartDate}
                externalEndDate={calendarEndDate}
                submitNewDateRange={(startDate : Date, endDate : Date) => {
                    setCalendarStartDate(startDate);
                    setCalendarEndDate(endDate);
                }}
   
            />
    }

    let changeSettingPreferredOption = {
        summaryText : "Set Preferred Timeslots",
        detail : <Container>
            {settingPreferred ? 
                <Typography>You are now setting your preferred availability slots. Our algorithm will specifically try to put you in the slots you mark as preferred.</Typography> 
                : 
                <Typography>You are now setting basic availability slots. Our algorithm could assign you to any slot you mark as available. </Typography>
            }
            <Button disabled={settingPreferred} variant="contained" onClick={() => setSettingPreferred(true)}>
                Set Preferred Times
            </Button>
            <Button disabled={!settingPreferred} variant="contained" onClick={() => setSettingPreferred(false)}>
                Set Standard Availability Times
            </Button>
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
                    {colorblindModeIsOn ? "\"a\" (for \"available\")" : "Green"} represents when you are available. Our scheduling algorithm can assign you to any timeslot shown here as green or gold
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                    {colorblindModeIsOn ? "\"u\" (\"for \"unavailable\")" : "Red"} represents when you are unavailable. Our scheduling algorithm will not assign to you a time when you are unavailable
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                    {colorblindModeIsOn ? "\"p\" (\"for \"preferred\")" : "Gold"} is for the timeslots you most want to be in. Our scheduling algorithm will make it a priority to assign you to these times when possible. 
                </ListItem>
                <ListItem sx={{display : 'list-item'}}>
                    {colorblindModeIsOn ? "\"x\" (for out of bounds)" : "Gray"} is for timeslots which fall outside of the time period where your group has to be in the tent
                </ListItem>
            </List>
        </Container>
    }
    
    return (
        <Container maxWidth="xs">
            <KvilleAccordion elements={[changeTimesOption, changeSettingPreferredOption, colorCodesOption]}/>
        </Container>
    );
}