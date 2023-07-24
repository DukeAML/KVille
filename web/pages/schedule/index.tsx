import React, {useContext, useState} from "react";
import { useQuery } from "react-query";

import { getInitialAvailabilityDisplayEndDate, getInitialAvailabilityDisplayStartDate } from "@/../common/calendarAndDates/calendar_services";
import { BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { ScheduleCalendarDatesContext } from "./scheduleCalendarDatesContext";
import { ScheduleOptions } from "./scheduleOptions";
import { UserContext } from "@/context/userContext";
import {fetchGroupSchedule} from "@/../common/db/schedule";
import {getDefaultDisplayDateRangeStartDate} from "@/../common/features/schedule/scheduleDates";
import ScheduleAndStartDate from '@/../common/Scheduling/scheduleAndStartDate';
import { OneDaySchedule } from "./oneDaySchedule";

export default function Schedule() {
    let [calendarStartDate, setCalendarStartDate] = useState<Date>(getInitialAvailabilityDisplayStartDate("black"));
    let [calendarEndDate, setCalendarEndDate] = useState<Date>(getInitialAvailabilityDisplayEndDate("black"));
    const defaultData = new ScheduleAndStartDate([], new Date(Date.now()));

    
    const {groupCode, userID} = useContext(UserContext); //TODO: refactor out group context
    const {data : scheduleAndStartDate, isLoading, isError} = useQuery<ScheduleAndStartDate, Error>(['getGroupSchedule', groupCode], 
        ()=> fetchGroupSchedule(groupCode),
        {
            initialData: defaultData,
            onSuccess: () => {console.log(scheduleAndStartDate?.schedule)}
        });
    const [dateBeingShown, setDateBeingShown] = useState<Date>(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));

    return (
        <BasePageContainerWithNavBarAndTitle title="Schedule">
            <ScheduleCalendarDatesContext.Provider value={{calendarStartDate, calendarEndDate, setCalendarStartDate, setCalendarEndDate}}>
                <ScheduleOptions/>
                <OneDaySchedule date={dateBeingShown} schedule={scheduleAndStartDate ? scheduleAndStartDate.schedule : new Array(48).fill("name")}/>
            </ScheduleCalendarDatesContext.Provider>



        </BasePageContainerWithNavBarAndTitle>
    )
}