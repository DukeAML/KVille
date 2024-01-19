import React, {useContext, useState}  from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography } from "@material-ui/core";
import {Container} from "@material-ui/core";
import { DatesRow } from "./datesRow";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import {getDefaultAssignDateRangeStartDate, getDefaultAssignDateRangeEndDate, validateAssignTentersDateRange} from "@/lib/calendarAndDatesUtils/schedule/assignTenters";
import { useFetchScheduleAndSetDefaultAssignTentersDate, useMutationToAssignTentersAndUpdateSchedule, useQueryToFetchSchedule } from "@/lib/hooks/scheduleHooks";
import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "@/lib/controllers/groupMembershipAndExistence/groupCodeController";
import { KvilleLoadingCircle } from "@/components/shared/utils/loading";
import { GroupContext } from "@/lib/context/groupContext";
import { ErrorMessage } from "@/components/shared/utils/errorMessage";



export const ScheduleOptions : React.FC = () => {
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const {data : scheduleAndStartDate, isLoading, defaultAssignDateRangeStartDate, defaultAssignDateRangeEndDate} = useFetchScheduleAndSetDefaultAssignTentersDate(groupCode);
    const {groupDescription} = useContext(GroupContext);
    const [badDateRangeMsg, setBadDateRangeMsg] = useState<string>("");
    const {mutate : runAlgoAndUpdateScheduleInDB, isError : isErrorCreatingNewSchedule, isLoading : isCreatingNewScheduleAndUpdatingDB, successMsg } = useMutationToAssignTentersAndUpdateSchedule(groupCode);
    
    let assignTentersOption = {
        summaryText : "Fill In Schedule",
        detail : 
            <Container>
                <Typography align="left" style={{marginBottom: 16}}>
                    Our algorithm will fill in your schedule between these times. Make sure everyone in your group has filled in their availability for the dates selected below!
                </Typography>
                <DateRangeChanger 
                    includeHours={true}
                    externalStartDate={defaultAssignDateRangeStartDate}
                    externalEndDate={defaultAssignDateRangeEndDate}
                    submitNewDateRange={(startDate : Date, endDate : Date) => {
                        if (scheduleAndStartDate){
                            let {successful, message} = validateAssignTentersDateRange(startDate, endDate, scheduleAndStartDate.startDate);
                        if (successful) {
                            let data = scheduleAndStartDate
                            runAlgoAndUpdateScheduleInDB({startDate, endDate, tentType : groupDescription.tentType, oldSchedule : data});
                        } else  {
                            setBadDateRangeMsg(message);
                            setTimeout(() => {
                                setBadDateRangeMsg("");
                            }, 3000);
                        }
                        }
                    }}
                />
                {(isCreatingNewScheduleAndUpdatingDB) ? <Typography align="center"><KvilleLoadingCircle/></Typography> : null}
                {isErrorCreatingNewSchedule ? <Typography align="center" style={{color : "red"}}>An Error Occurred</Typography> : null}
                {badDateRangeMsg.length > 1 ? <ErrorMessage msg={badDateRangeMsg}/> : null}
                {successMsg.length > 1 ? <Typography align="center">{successMsg}</Typography> : null}
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