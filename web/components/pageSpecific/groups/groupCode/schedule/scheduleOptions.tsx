import React, {useContext, useState}  from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography } from "@material-ui/core";
import {Container} from "@material-ui/core";
import { DatesRow } from "./datesRow";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import {getDefaultAssignDateRangeStartDate, getDefaultAssignDateRangeEndDate, validateAssignTentersDateRange} from "../../../../../../common/src/frontendLogic/schedule/assignTenters";
import { ScheduleAndStartDate } from "../../../../../../common/src/db/schedule/scheduleAndStartDate";
import { useMutationToAssignTentersAndUpdateSchedule, useQueryToFetchSchedule } from "../../../../../lib/pageSpecific/schedule/scheduleHooks";
import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "../../../../../../common/src/db/groupExistenceAndMembership/GroupCode";
import { KvilleLoadingCircle } from "@/components/shared/utils/loading";
import { scheduleDates } from "../../../../../../common/data/scheduleDates";
import { GroupContext } from "@/lib/shared/context/groupContext";



export const ScheduleOptions : React.FC = () => {
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const {data : scheduleAndStartDate, isLoading} = useQueryToFetchSchedule(groupCode);
    const {groupDescription} = useContext(GroupContext);
    const [badDateRangeMsg, setBadDateRangeMsg] = useState<string>("");

    const {mutate : updateScheduleInDB, error, isError : isErrorCreatingNewSchedule, isLoading : isCreatingNewScheduleAndUpdatingDB } = useMutationToAssignTentersAndUpdateSchedule(groupCode);
    
    const getDefinedScheduleAndStartDate = () : ScheduleAndStartDate => {
        if (scheduleAndStartDate){
            return scheduleAndStartDate;
        } else {
            return new ScheduleAndStartDate([], scheduleDates.startOfBlack);
        }
    }



    let assignTentersOption = {
        summaryText : "Assign Tenters",
        detail : 
            <Container>
                <DateRangeChanger 
                    includeHours={true}
                    externalStartDate={getDefaultAssignDateRangeStartDate(getDefinedScheduleAndStartDate().schedule, getDefinedScheduleAndStartDate().startDate)}
                    externalEndDate={getDefaultAssignDateRangeEndDate(getDefinedScheduleAndStartDate().schedule, getDefinedScheduleAndStartDate().startDate)}
                    submitNewDateRange={(startDate : Date, endDate : Date) => {
                        let {successful, message} = validateAssignTentersDateRange(startDate, endDate, getDefinedScheduleAndStartDate().startDate);
                        if (successful) {
                            let data = getDefinedScheduleAndStartDate();
                            updateScheduleInDB({startDate, endDate, tentType : groupDescription.tentType, oldSchedule : data});
                        } else  {
                            setBadDateRangeMsg(message);
                            setTimeout(() => {
                                setBadDateRangeMsg("");
                            }, 2000);
                        }
                    }}
                />
                {(isCreatingNewScheduleAndUpdatingDB) ? <Typography align="center"><KvilleLoadingCircle/></Typography> : null}
                {isErrorCreatingNewSchedule ? <Typography align="center" style={{color : "red"}}>An Error Occurred</Typography> : null}
                {badDateRangeMsg.length > 1 ? <Typography align="center" style={{color : "red"}}>{badDateRangeMsg}</Typography> : null}
            </Container>
    }
    
    return (
        <Container maxWidth="md" style={{marginTop: 12}}>
            <Container maxWidth="sm">
                <KvilleAccordion elements={[assignTentersOption]} />
            </Container>
            <DatesRow/>
        </Container>
    );
}