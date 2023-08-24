import React, {useContext, useState, useRef, useEffect} from "react";
import { useQuery } from "react-query";
import { BasePageContainerForGroupsPage, BasePageContainerWithNavBarAndTitle } from "@/components/basePageContainer";
import { ScheduleOptions } from "./scheduleOptions";
import { UserContext } from "@/context/userContext";
import {fetchGroupSchedule} from "../../../../../common/src/db/schedule";
import {getDefaultDisplayDateRangeStartDate} from "../../../../../common/src/frontendLogic/schedule/scheduleDates";
import {ScheduleAndStartDate} from '../../../../../common/src/Scheduling/scheduleAndStartDate';
import { OneDaySchedule } from "./scheduleCalendar/oneDaySchedule";
import { Typography } from "@mui/material";
import { CellColorsCoordinator } from "./cellColorsCoordinator";
import { CellColorsContext } from "./context/cellColorsContext";
import { DateBeingShownContext } from "./context/dateBeingShownContext";
import { getQueryKeyNameForGroupCode, useQueryToFetchSchedule } from "./hooks/scheduleHooks";
import { GroupContext } from "@/context/groupContext";
import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "@/pages/_app";
import { KvilleLoadingContainer } from "@/components/utils/loading";


export default function Schedule() {
    const defaultData = new ScheduleAndStartDate([], new Date(Date.now()));
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;

    
    const {userID} = useContext(UserContext); //TODO: refactor out group context
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const {groupDescription} = useContext(GroupContext);
    const {data : scheduleAndStartDate, isLoading, isError} = useQueryToFetchSchedule(groupCode);

    const [dateBeingShown, setDateBeingShown] = useState<Date>(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));

    useEffect(() => {
        setDateBeingShown(getDefaultDisplayDateRangeStartDate(scheduleAndStartDate ? scheduleAndStartDate : defaultData));
    }, [scheduleAndStartDate]);

    let body = null;
    if (isLoading){
        body = <KvilleLoadingContainer/>
    } else {
        body = (
            <DateBeingShownContext.Provider value={{dateBeingShown : dateBeingShown, setDateBeingShown : setDateBeingShown}}>
                <CellColorsContext.Provider value={{cellColorsCoordinator : cellColorCoordinator}}>
                    <ScheduleOptions/>
                    
                    <OneDaySchedule/>
                </CellColorsContext.Provider>
            </DateBeingShownContext.Provider>
        );
    }
    
    //console.log(scheduleAndStartDate);
    return (
        <BasePageContainerForGroupsPage title="Schedule">
            {body}
        </BasePageContainerForGroupsPage>
    )
}

