import { useQueryToFetchSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import React, { useContext, useEffect, useState } from "react";
import { getDatePlusNumShifts, getNumSlotsBetweenDates } from "../../../../../../../common/src/calendarAndDates/datesUtils";
import { Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import { EMPTY } from "../../../../../../../common/src/scheduling/slots/tenterSlot";


export const SwapTentersTimeRangePickers : React.FC = () => {
    const [eligibleTimeslotStartDates, setEligibleTimeslotStartDates] = useState<Date[]>([]);
    const {startReplacementDate, setStartReplacementDate, endReplacementDate, setEndReplacementDate, timeSlotClickedOn, newTenter, setNewTenter, tenterToReplace} = useContext(TenterSwapContext);
    const groupCode = useGroupCode();
    const { data : schedule} = useQueryToFetchSchedule(groupCode);

    useEffect(() => {
        setNewTenter("");
        setStartReplacementDate(timeSlotClickedOn);
        setEndReplacementDate(getDatePlusNumShifts(timeSlotClickedOn, 1));
    }, [timeSlotClickedOn])
    
    useEffect(() => {
		if (schedule) {
			const startdate = schedule.startDate;
			const originalDateIndex = getNumSlotsBetweenDates(startdate, timeSlotClickedOn);
			let startIndex = originalDateIndex;
	
			while (startIndex > 0 && scheduleSlotInclusionExclusionCheck(schedule.getNamesAtTimeIndex(startIndex -1), tenterToReplace, newTenter)) {
				startIndex -= 1;
			}
			
		
			let lastIndex = originalDateIndex;
			while (lastIndex < schedule.schedule.length - 1 && scheduleSlotInclusionExclusionCheck(schedule.getNamesAtTimeIndex(lastIndex + 1), tenterToReplace, newTenter)) {
				lastIndex += 1;
			}
	
			let slots = [];
			for (let i = startIndex; i <= lastIndex; i++) {
				slots.push(getDatePlusNumShifts(timeSlotClickedOn, i - originalDateIndex));
			}
			setEligibleTimeslotStartDates(slots);
			setStartReplacementDate(slots[0]);
			setEndReplacementDate(getDatePlusNumShifts(slots[slots.length -1], 1));
		}
    }, [newTenter, timeSlotClickedOn]);

    const startDateItems = eligibleTimeslotStartDates?.map((item) => (
        <MenuItem value={startDateToMenuItemString(item)} key={item.getTime()}>{startDateToMenuItemString(item)}</MenuItem>
      ));
    const endDateItems = eligibleTimeslotStartDates?.map((item) => (
      	<MenuItem value={endDateToMenuItemString(item)} key={item.getTime()}>{endDateToMenuItemString(item)}</MenuItem>
    ));
    return (
        <>
            <FormControl fullWidth>
                <InputLabel id="start-time-label">Start Time</InputLabel>
                <Select
                labelId="start-time-label"
                id="start-time-select"
                value={dateToMenuItemString(startReplacementDate)}
                label="Select Start Time"
                onChange={(e) => {
                    if (typeof(e.target.value) === "string"){
						for (let i = 0; i < eligibleTimeslotStartDates.length ; i += 1){
							if (startDateToMenuItemString(eligibleTimeslotStartDates[i]) === e.target.value){
								setStartReplacementDate(eligibleTimeslotStartDates[i]);
								break;
							}
						}
                    }
                }}
                >
                    {startDateItems}
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel id="end-time-label">End Time</InputLabel>
                <Select
                labelId="end-time-label"
                id="end-time-picker"
                value={dateToMenuItemString(endReplacementDate)}
                label="Select End Time"
                onChange={(e) => {
                    if (typeof(e.target.value) === "string"){
						for (let i = 0; i < eligibleTimeslotStartDates.length ; i += 1){
							if (endDateToMenuItemString(eligibleTimeslotStartDates[i]) === e.target.value){
								setEndReplacementDate(getDatePlusNumShifts(eligibleTimeslotStartDates[i], 1));
								break;
							}
						}
                    }
                }}
                >
                {endDateItems}
                </Select>
            </FormControl>
        </>
    )
}

function scheduleSlotInclusionExclusionCheck(slotNames : string[], personToInclude : string, personToExclude : string) : boolean {
    if (slotNames.includes(personToInclude) && (!slotNames.includes(personToExclude) || (personToExclude === EMPTY))){
      	return true;
    } else {
      	return false;
    }
  }

function startDateToMenuItemString(slotStartDate : Date) : string {
	return dateToMenuItemString(slotStartDate);
}
function endDateToMenuItemString(slotStartDate : Date) : string {
    return dateToMenuItemString(getDatePlusNumShifts(slotStartDate, 1));
}
  
function dateToMenuItemString(slotStartDate : Date) : string {
    let str = (slotStartDate.getMonth() + 1).toFixed(0) + "/" + slotStartDate.getDate().toFixed(0);
    let hoursNum = slotStartDate.getHours() % 12;
    if (hoursNum == 0){
      	hoursNum = 12;
    }
    str += " " + hoursNum.toFixed(0) + ":";
    if (slotStartDate.getMinutes() < 20){
    	str += "00";
    } else {
      	str += "30";
    }
  
    if (slotStartDate.getHours() >= 12){
      	str += "pm";
    } else {
      	str += "am";
    }
  
    // Format the final string
    return str;
  
  }