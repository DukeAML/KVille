import { useMutationToUpdateSchedule, useQueryToFetchSchedule } from "@/lib/hooks/scheduleHooks";
import { INVALID_NEW_TENTER, TenterSwapContext } from "@/lib/context/schedule/tenterSwapContext";
import { useGroupCode } from "@/lib/hooks/useGroupCode";
import { Typography, Container, Button, Modal, Dialog} from "@mui/material";
import React, { useContext,  useState } from "react";
import { getNumSlotsBetweenDates } from "@/lib/calendarAndDatesUtils/datesUtils";
import { ScheduleData } from "@/lib/controllers/scheduleData";
import { SwapTentersTimeRangePickers } from "./timeRangePickers";
import { NewTenterPicker } from "./newTenterPicker";
import { KvilleLoadingCircle } from "@/components/shared/utils/loading";
import Draggable from "react-draggable";
import Backdrop from "@mui/material";


export const TenterSwapper: React.FC = () => {
  const { isSwappingTenter, setIsSwappingTenter, tenterToReplace, newTenter, startReplacementDate,  endReplacementDate, setTenterToReplace, timeSlotClickedOn} = useContext(TenterSwapContext);
  const groupCode = useGroupCode();
  const { mutate: updateSchedule, isLoading : isLoadingUpdate, isError : isErrorUpdating} = useMutationToUpdateSchedule(groupCode);
  const { data : schedule} = useQueryToFetchSchedule(groupCode);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const submit = () => {
    if (schedule){
      if (endReplacementDate <= startReplacementDate){
        setErrorMsg("End Date Must Come After Start Date");
        return;
      }
      if (newTenter === INVALID_NEW_TENTER){
        setErrorMsg("Must pick a new tenter!");
        return;
      }
      setErrorMsg("");
      let newSchedule = new ScheduleData({...schedule}.schedule, {...schedule}.startDate, {...schedule}.IDToNameMap);
      const startdate = schedule?.startDate as Date;
      const startIndex = getNumSlotsBetweenDates(startdate, startReplacementDate);
      const endIndex = getNumSlotsBetweenDates(startdate, endReplacementDate);
      for (let timeIndex = startIndex; timeIndex < endIndex; timeIndex += 1){
        newSchedule.swapTenterAtIndexByNames(timeIndex, tenterToReplace, newTenter);
      }
      updateSchedule(newSchedule);
      setIsSwappingTenter(false);
    } 
  };

  if (!isSwappingTenter) {
    return null;
  } else {
    return (
      <Draggable>
        <Dialog open={isSwappingTenter} hideBackdrop={true}>
          <Container maxWidth="xs">
            <Typography variant="h4" style={{marginTop : 8, marginBottom : 4}}>Swap Tenters</Typography>
            <Typography>Replace {tenterToReplace}</Typography>
            <NewTenterPicker/>
            <SwapTentersTimeRangePickers/>
            <Button onClick={() => submit()} color="primary" variant="contained">
              Submit
            </Button>
            <Button style={{marginTop : 8, marginRight : 8, marginLeft : 8, marginBottom : 8}} onClick={() => setIsSwappingTenter(false)} color="error" variant="contained">
              Cancel
            </Button>
            {isLoadingUpdate ? <KvilleLoadingCircle/> : null}
            {errorMsg.length > 0 ? <Typography color="red">{errorMsg}</Typography> : null}
            {isErrorUpdating ? <Typography color="red">An Unknown Error Occurred</Typography> : null}
          </Container>
        </Dialog>
      </Draggable>
      );
  };
}

