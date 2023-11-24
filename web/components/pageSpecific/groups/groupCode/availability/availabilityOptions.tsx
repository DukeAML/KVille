import React, {useContext} from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography, Container, Button, List, ListItem } from "@mui/material";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import { AvailabilityPageContext } from '@/lib/pageSpecific/availability/AvailabilityPageContextType';


export const AvailabilityOptions : React.FC = () => {
    const {calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate, settingPreferred, setSettingPreferred} = useContext(AvailabilityPageContext);

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
            <Button disabled={settingPreferred} onClick={() => setSettingPreferred(true)}>
                Set Preferred Times
            </Button>
            <Button disabled={!settingPreferred} onClick={() => setSettingPreferred(false)}>
                Set Standard Availability Times
            </Button>
        </Container>
    }

    let colorCodesOption = {
        summaryText : "Color Codes Visible",
        detail : <Container>
            <List sx={{ listStyleType: 'disc' }}>
                <ListItem sx={{ display: 'list-item' }}>
                    Green represents when you are available. Our scheduling algorithm can assign you to any timeslot shown here as green or gold
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                    Red represents when you are unavailable. Our scheduling algorithm will not assign to you a time when you are unavailable
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                    Gold is for the timeslots you most want to be in. Our scheduling algorithm will make it a priority to assign you to these times when possible. 
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