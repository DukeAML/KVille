import React, { useContext, useState } from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { useGroupCode } from "@/lib/hooks/useGroupCode";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { Typography, Container, Link, Button, Stack } from '@mui/material'
import { HoursTable } from "@/components/pageSpecific/groups/groupCode/groupOverview/hoursTable";
import { EditableGroupName } from "@/components/pageSpecific/groups/groupCode/groupOverview/editableGroupName";
import { useQueryToFetchSchedule } from "@/lib/hooks/scheduleHooks";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { DiscretionaryGraceContext } from "@/lib/context/discretionaryContext";

const GroupHomePage : React.FC = () => {    

    const groupCode = useGroupCode();
    const {data : schedule, isLoading} = useQueryToFetchSchedule(groupCode);
    const [showingDiscretionaryGrace, setShowingDiscretionaryGrace] = useState<boolean>(false);

    return (
        <PermissionRequiredPageContainer title={""} groupSpecificPage={true}>
            <DiscretionaryGraceContext.Provider value={{showingDiscretionaryGrace, setShowingDiscretionaryGrace}}>
                <EditableGroupName/>
                <Container maxWidth="md">
                    <Typography align="left" style={{marginTop : 16, marginBottom : 16}} variant="h6">
                        Here are your group members, along with how many hours they are scheduled for. Other people can join your group through the <Link href="/groups/joinGroup">Join Group page</Link>, with the following group code: {groupCode}
                    </Typography>
                    

                </Container>
                {(isLoading || !schedule) ? (
                    // Display the loading container while data is being loaded
                    <KvilleLoadingContainer />
                ) : 
                    <Stack direction="column" gap={1}>
                    <HoursTable schedule={schedule}/>
                    <Container maxWidth="md" style={{marginTop : 24, marginBottom : 24}}>
                        <KvilleAccordion elements={
                            [
                                {
                                    summaryText : "Hours Adjusted for Grace Periods",
                                    detail : 
                                        <Container>
                                            <Typography style={{marginBottom : 8}}>
                                                When the line monitors call a tent check and there&apos;s grace for the next hour, the people who are assigned to be in the
                                                tent at that time won&apos;t have to show up for their scheduled shift. This also happens when grace is called for bad weather. 
                                                By pressing the button below, you can see how much time everyone has
                                                actually spent in the time compared to how much time they were scheduled for.
                                                Please note that our tracking of these discretionary grace periods
                                                is not guaranteed to be 100% accurate or up to date. Our scheduling algorithm also does not account for discretionary grace 
                                                periods when balancing the fairness. They are supposed to come as a relief, not something you feel obligated to make up for
                                            </Typography>
                                            <Stack direction="column" gap={1}>
                                                <Button disabled={showingDiscretionaryGrace} variant="contained" onClick={() => setShowingDiscretionaryGrace(true)}>
                                                    Show hours data accounting for discretionary grace
                                                </Button>
                                                <Button disabled={!showingDiscretionaryGrace} variant="contained" onClick={() => setShowingDiscretionaryGrace(false)}>
                                                    Show hours data ignoring discretionary grace
                                                </Button>
                                            </Stack>
                                        </Container>
                                }
                            ]
                        }/>
                    </Container>
                    </Stack>}
                
            </DiscretionaryGraceContext.Provider>
        </PermissionRequiredPageContainer>
    );
}


export default GroupHomePage;