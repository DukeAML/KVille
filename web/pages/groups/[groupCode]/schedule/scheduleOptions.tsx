import React, {useContext, useState} from "react";
import { KvilleAccordion } from "@/components/utils/accordion";
import { Typography } from "@material-ui/core";
import {Container} from "@material-ui/core";
import { DatesRow } from "./datesRow";
import { DateRangeChanger } from "@/components/dateRangeChanger/dateRangeChanger";
import {getDefaultAssignDateRangeStartDate, getDefaultAssignDateRangeEndDate, validateAssignTentersDateRange} from "../../../../../common/features/schedule/assignTenters";
import { useQueryClient } from "react-query";
import { UserContext } from "@/context/userContext";
import { ScheduleAndStartDate } from "../../../../../common/Scheduling/scheduleAndStartDate";
import { getQueryDataForSchedule, getQueryKeyNameForGroupCode, useMutationToUpdateSchedule } from "./hooks/scheduleHooks";
import { assignTentersAndGetNewFullSchedule } from "../../../../../common/Scheduling/CreateGroupSchedule";
import { GroupContext } from "@/context/groupContext";



export const ScheduleOptions : React.FC = () => {
    const {groupDescription : {groupCode, tentType}} = useContext(GroupContext);
    const scheduleAndStartDate : ScheduleAndStartDate | undefined = getQueryDataForSchedule(groupCode);
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
                    assignTentersAndGetNewFullSchedule(groupCode, tentType, startDate, endDate, data)
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