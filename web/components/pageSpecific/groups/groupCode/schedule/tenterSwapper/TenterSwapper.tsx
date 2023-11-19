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
import React, { useContext, useEffect, useState } from "react";
import { FormControl, InputLabel } from "@mui/material";
import {
  getDatePlusNumShifts,
  getNumSlotsBetweenDates,
} from "../../../../../../../common/src/calendarAndDates/datesUtils";
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
  const [eligibleTimeslots, setEligibleTimeslots] = useState<Date[]>();

  const {
    data: groupMembers,
    isLoading: isLoadingGroupMembers,
    isError: isErrorLoadingGroupMembers,
  } = useQueryToFetchGroupMembers(groupCode);
  const [changeVal, setChangeVal] = React.useState("");
  const handleChange = (event: SelectChangeEvent) => {
    setChangeVal(event.target.value as string);
  };
  const [startReplace, setStartReplace] = useState("");
  const startChange = (event: SelectChangeEvent) => {
    setStartReplace(event.target.value as string);
  };
  const [endReplace, setEndReplace] = useState("");
  const endChange = (event: SelectChangeEvent) => {
    setEndReplace(event.target.value as string);
  };
  useEffect(() => {
    if (isSwappingTenter) {
      let currentSchedule = schedule ? [...schedule.schedule] : [];
      const startdate = schedule?.startDate as Date;
      const originalDate = getNumSlotsBetweenDates(
        startdate,
        timeSlotClickedOn
      );
      let startIndex = originalDate;
      while (
        startIndex > 0 &&
        currentSchedule[startIndex - 1].includes(tenterToReplace)
      ) {
        startIndex -= 1;
      }
      let lastIndex = originalDate;
      while (
        lastIndex < currentSchedule.length - 1 &&
        currentSchedule[lastIndex + 1].includes(tenterToReplace)
      ) {
        lastIndex += 1;
      }

      let slots = [];
      for (let i = startIndex; i <= lastIndex; i++) {
        slots.push(getDatePlusNumShifts(timeSlotClickedOn, i - originalDate));
      }
      setEligibleTimeslots(slots);
    }
  }, [changeVal]);

  if (!isSwappingTenter) {
    return null;
  }
  const menuItems = groupMembers?.map((item) => (
    <MenuItem value={item.username}>{item.username}</MenuItem>
  ));
  const dateItems = eligibleTimeslots?.map((item) => (
    <MenuItem value={item.toString()}>{item.toString()}</MenuItem>
  ));
  const submit = () => {
    console.log(changeVal);
    let newSchedule = schedule ? [...schedule.schedule] : [];
    const startdate = schedule?.startDate as Date;
    const startIndex = getNumSlotsBetweenDates(
      startdate,
      new Date(startReplace)
    );
    const endIndex = getNumSlotsBetweenDates(startdate, new Date(endReplace));
    for (let i = startIndex; i <= endIndex; i++) {
      newSchedule[i] = newSchedule[i].replace(tenterToReplace, changeVal);
    }
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
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Start Time</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={startReplace}
          label="Select Start Time"
          onChange={startChange}
        >
          {dateItems}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">End Time</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={endReplace}
          label="New Tenter"
          onChange={endChange}
        >
          {dateItems}
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
