import React, {useContext, useState, useRef, useEffect} from "react";
import { useQuery } from "react-query";
import { BasePageContainerForGroupsPage, BasePageContainerWithNavBarAndTitle } from "@/components/shared/basePageContainer";
import { ScheduleOptions } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleOptions";
import { UserContext } from "@/lib/shared/context/userContext";
import {fetchGroupSchedule} from "../../../../../common/src/db/schedule";
import {getDefaultDisplayDateRangeStartDate} from "../../../../../common/src/frontendLogic/schedule/scheduleDates";
import {ScheduleAndStartDate} from '../../../../../common/src/Scheduling/scheduleAndStartDate';
import { OneDaySchedule } from "../../../../components/pageSpecific/groups/groupCode/schedule/scheduleCalendar/oneDaySchedule";
import { Typography } from "@mui/material";
import { CellColorsCoordinator } from "../../../../components/pageSpecific/groups/groupCode/schedule/cellColorsCoordinator";
import { CellColorsContext } from "../../../../lib/pageSpecific/schedule/cellColorsContext";
import { DateBeingShownContext } from "../../../../lib/pageSpecific/schedule/dateBeingShownContext";
import { getQueryKeyNameForGroupCode, useQueryToFetchSchedule } from "../../../../lib/pageSpecific/schedule/scheduleHooks";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "@/pages/_app";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";


export default function Schedule() {
    const defaultData = new ScheduleAndStartDate([], new Date(Date.now()));
    const cellColorCoordinator = useRef<CellColorsCoordinator>(new CellColorsCoordinator()).current;

    
    const {userID} = useContext(UserContext); //TODO: refactor out group context
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    console.log("the group code is " + groupCode);
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

