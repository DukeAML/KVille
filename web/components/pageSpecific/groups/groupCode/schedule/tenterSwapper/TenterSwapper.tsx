import { useGetQueryDataForSchedule, useMutationToUpdateSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext"
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { Typography, Container, Button } from "@mui/material";
import React, {useContext} from "react"

export const TenterSwapper : React.FC = () => {
    const {isSwappingTenter, setIsSwappingTenter, tenterToReplace, timeSlotClickedOn} = useContext(TenterSwapContext);
    const groupCode = useGroupCode();
    const {mutate : updateSchedule, isLoading : isLoadingNewSchedule, isError} = useMutationToUpdateSchedule(groupCode);
    let schedule = useGetQueryDataForSchedule(groupCode); 

    
    if (!isSwappingTenter){
        return null;
    }
    return (
        <Container maxWidth="xs">
            <Typography variant="h4">Swap Tenters</Typography>
            <Typography>{tenterToReplace}</Typography>
            <Typography>{timeSlotClickedOn.toISOString()}</Typography>
            <Button onClick={() => setIsSwappingTenter(false)} color="error" variant="contained" >Cancel</Button>
        </Container>
        
    )
}