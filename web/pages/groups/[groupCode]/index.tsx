import React, { useContext, useState } from "react";
import { PermissionRequiredPageContainer } from "@/components/shared/pageContainers/permissionRequiredPageContainer";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { KvilleLoadingContainer } from "@/components/shared/utils/loading";
import { Typography, Container, Link, Button, Stack } from '@mui/material'
import { HoursTable } from "@/components/pageSpecific/groups/groupCode/groupOverview/hoursTable";
import { EditableGroupName } from "@/components/pageSpecific/groups/groupCode/groupOverview/editableGroupName";
import { useQueryToFetchSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { KvilleAccordion } from "@/components/shared/utils/accordion";
import { DiscretionaryGraceContext } from "@/lib/pageSpecific/groupOverview/discretionaryContext";

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
                    <Container maxWidth="md" style={{marginBottom : 24}}>
                        <KvilleAccordion elements={
                            [
                                {
                                    summaryText : "Discretionary Grace",
                                    detail : 
                                        <Container>
                                            <Typography style={{marginBottom : 8}}>
                                                Click the button below to show everyone's hours when accounting for discretionary grace. A discretionary grace period 
                                                is any grace period not known before the start of tenting season. Examples include grace for when it is too cold
                                                at night and grace after a tent check, but not the grace periods known of before the start of tenting - i.e. grace week
                                                and the periods before and after each basketball game. Please note that our tracking of these discretionary grace periods
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

                </Container>
                {(isLoading || !schedule) ? (
                    // Display the loading container while data is being loaded
                    <KvilleLoadingContainer />
                ) : <HoursTable schedule={schedule}/>}
            </DiscretionaryGraceContext.Provider>
        </PermissionRequiredPageContainer>
    );
}


export default GroupHomePage;