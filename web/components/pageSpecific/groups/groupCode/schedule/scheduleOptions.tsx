import React, {useContext, useState} from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography } from "@material-ui/core";
import {Container} from "@material-ui/core";
import { DatesRow } from "./datesRow";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import {getDefaultAssignDateRangeStartDate, getDefaultAssignDateRangeEndDate, validateAssignTentersDateRange} from "../../../../../../common/src/frontendLogic/schedule/assignTenters";
import { useQueryClient } from "react-query";
import { UserContext } from "@/lib/shared/context/userContext";
import { ScheduleAndStartDate } from "../../../../../../common/src/db/schedule/scheduleAndStartDate";
import { useGetQueryDataForSchedule, getQueryKeyNameForGroupCode, useMutationToUpdateSchedule, useQueryToFetchSchedule } from "../../../../../lib/pageSpecific/schedule/scheduleHooks";
import { assignTentersAndGetNewFullSchedule } from "../../../../../../common/src/scheduling/externalInterface/createGroupSchedule";
import { GroupContext } from "@/lib/shared/context/groupContext";
import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "../../../../../../common/src/db/groupExistenceAndMembership/GroupCode";
import { TENTING_COLORS } from "../../../../../../common/data/phaseData";



export const ScheduleOptions : React.FC = () => {
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const scheduleAndStartDate = useGetQueryDataForSchedule(groupCode);
   
    const queryClient = useQueryClient();

    const {mutate : updateScheduleInDB, error, isError, isLoading } = useMutationToUpdateSchedule(groupCode, 
        (newSchedule : string[]) => {
            console.log("made it to the on success method");
            
            let queryKeyName = getQueryKeyNameForGroupCode(groupCode);
            let oldData : ScheduleAndStartDate | undefined = queryClient.getQueryData(queryKeyName);
            if (oldData === undefined) {
                queryClient.invalidateQueries(queryKeyName);
            } else {
                let newData = new ScheduleAndStartDate(newSchedule, oldData.startDate);
                queryClient.setQueryData(queryKeyName, newData);
            }
            console.log("made it to the end of the on success method");
            
        });
    

    const getDefinedScheduleAndStartDate = () : ScheduleAndStartDate => {
        if (scheduleAndStartDate){
            return scheduleAndStartDate;
        } else {
            return new ScheduleAndStartDate([], new Date(Date.now()));
        }
    }



    let assignTentersOption = {
        summary : <Typography>Assign Tenters</Typography>,
        detail : <DateRangeChanger 
            includeHours={true}
            externalStartDate={getDefaultAssignDateRangeStartDate(getDefinedScheduleAndStartDate().schedule, getDefinedScheduleAndStartDate().startDate)}
            externalEndDate={getDefaultAssignDateRangeEndDate(getDefinedScheduleAndStartDate().schedule, getDefinedScheduleAndStartDate().startDate)}
            submitNewDateRange={(startDate : Date, endDate : Date) => {
                let {successful, message} = validateAssignTentersDateRange(startDate, endDate, getDefinedScheduleAndStartDate().startDate);
                if (successful) {
                    let data = getDefinedScheduleAndStartDate();
                    assignTentersAndGetNewFullSchedule(groupCode, TENTING_COLORS.BLACK, startDate, endDate, data)
                        .then((newSchedule) => {
                            console.log("new schedule slot 1 is " );
                            console.log(newSchedule);
                            updateScheduleInDB(newSchedule);
                        })
                        .catch((error) => {
                            console.log("Error creating the new schedule");
                        });
                    
                } else  {
                    console.log(message);
                }
            }}
            />
    }
    
    return (
        <Container maxWidth="md">
            <KvilleAccordion elements={[assignTentersOption]}/>
            <DatesRow/>
        </Container>
    );
}