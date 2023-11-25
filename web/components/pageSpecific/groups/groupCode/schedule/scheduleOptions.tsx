import React, {useState}  from "react";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { Typography } from "@material-ui/core";
import {Container} from "@material-ui/core";
import { DatesRow } from "./datesRow";
import { DateRangeChanger } from "@/components/shared/dateRangeChanger/dateRangeChanger";
import {getDefaultAssignDateRangeStartDate, getDefaultAssignDateRangeEndDate, validateAssignTentersDateRange} from "../../../../../../common/src/frontendLogic/schedule/assignTenters";
import { ScheduleAndStartDate } from "../../../../../../common/src/db/schedule/scheduleAndStartDate";
import { useGetQueryDataForSchedule, useMutationToUpdateSchedule, useQueryToFetchSchedule } from "../../../../../lib/pageSpecific/schedule/scheduleHooks";
import { assignTentersAndGetNewFullSchedule } from "../../../../../../common/src/scheduling/externalInterface/createGroupSchedule";
import { useRouter } from "next/router";
import { INVALID_GROUP_CODE } from "../../../../../../common/src/db/groupExistenceAndMembership/GroupCode";
import { TENTING_COLORS } from "../../../../../../common/data/phaseData";
import { KvilleLoadingCircle } from "@/components/shared/utils/loading";
import { scheduleDates } from "../../../../../../common/data/scheduleDates";



export const ScheduleOptions : React.FC = () => {
    const router = useRouter();
    const groupCode = router.query.groupCode ? router.query.groupCode.toString() : INVALID_GROUP_CODE;
    const {data : scheduleAndStartDate, isLoading} = useQueryToFetchSchedule(groupCode);
    const [isLoadingNewSchedule, setIsLoadingNewSchedule] = useState<boolean>(false);

    const {mutate : updateScheduleInDB, error, isError, isLoading : isUpdatingDB } = useMutationToUpdateSchedule(groupCode);
    
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
                            setIsLoadingNewSchedule(true);
                            assignTentersAndGetNewFullSchedule(groupCode, TENTING_COLORS.BLACK, startDate, endDate, data)
                                .then((newSchedule) => {
                                    setIsLoadingNewSchedule(false);
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
                {(isLoadingNewSchedule || isUpdatingDB) ? <KvilleLoadingCircle/> : null}
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