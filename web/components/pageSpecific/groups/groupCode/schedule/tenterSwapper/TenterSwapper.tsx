import {
  useGetQueryDataForSchedule,
  useMutationToUpdateSchedule,
  useQueryToFetchGroupMembers,
} from "@/lib/pageSpecific/schedule/scheduleHooks";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import {
  Typography,
  Container,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import React, { useContext } from "react";
import { FormControl, InputLabel } from "@mui/material";
import { getNumSlotsBetweenDates } from "../../../../../../../common/src/calendarAndDates/datesUtils";
export const TenterSwapper: React.FC = () => {
  const {
    isSwappingTenter,
    setIsSwappingTenter,
    tenterToReplace,
    timeSlotClickedOn,
  } = useContext(TenterSwapContext);
  const groupCode = useGroupCode();
  const {
    mutate: updateSchedule,
    isLoading: isLoadingNewSchedule,
    isError,
  } = useMutationToUpdateSchedule(groupCode);
  let schedule = useGetQueryDataForSchedule(groupCode);

  const {
    data: groupMembers,
    isLoading: isLoadingGroupMembers,
    isError: isErrorLoadingGroupMembers,
  } = useQueryToFetchGroupMembers(groupCode);
  const [changeVal, setChangeVal] = React.useState("");
  const handleChange = (event: SelectChangeEvent) => {
    setChangeVal(event.target.value as string);
  };
  if (!isSwappingTenter) {
    return null;
  }
  const menuItems = groupMembers?.map((item) => (
    <MenuItem value={item.username}>{item.username}</MenuItem>
  ));
  const submit = () => {
    console.log(changeVal);
    let newSchedule = schedule ? [...schedule.schedule] : [];
    const startdate = schedule?.startDate as Date;
    const index = getNumSlotsBetweenDates(startdate, timeSlotClickedOn);
    newSchedule[index] = newSchedule[index].replace(tenterToReplace, changeVal);
    console.log(newSchedule[index]);
    updateSchedule(newSchedule);
  };
  return (
    <Container maxWidth="xs">
      <Typography variant="h4">Swap Tenters</Typography>
      <Typography>{tenterToReplace}</Typography>
      <Typography>{timeSlotClickedOn.getHours()}</Typography>

      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={changeVal}
          label="New Tenter"
          onChange={handleChange}
        >
          {menuItems}
        </Select>
      </FormControl>
      <Button onClick={() => submit()} color="error" variant="contained">
        Submit
      </Button>
      <Button
        onClick={() => setIsSwappingTenter(false)}
        color="error"
        variant="contained"
      >
        Cancel
      </Button>
    </Container>
  );
};
