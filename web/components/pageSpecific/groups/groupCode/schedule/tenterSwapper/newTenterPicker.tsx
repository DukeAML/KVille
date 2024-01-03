import { useQueryToFetchSchedule } from "@/lib/pageSpecific/schedule/scheduleHooks";
import { TenterSwapContext } from "@/lib/pageSpecific/schedule/tenterSwapContext";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import React, { useContext} from "react";
import {  getNumSlotsBetweenDates } from "../../../../../../../common/src/calendarAndDates/datesUtils";
import { Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import { EMPTY } from "../../../../../../../common/src/scheduling/slots/tenterSlot";

export const NewTenterPicker : React.FC = () => {
    const {tenterToReplace, timeSlotClickedOn, newTenter, setNewTenter} = useContext(TenterSwapContext);
    const groupCode = useGroupCode();
    const { data : schedule} = useQueryToFetchSchedule(groupCode);
    const checkIfMemberIsAValidReplacement = (memberUsername : string) : boolean => {
        if (schedule){
            let timeIndex = getNumSlotsBetweenDates(schedule.startDate, timeSlotClickedOn);
            if (memberUsername === tenterToReplace){
                return false;
            } else if (memberUsername !== EMPTY && schedule.containsMemberAtTimeIndexByUsername(timeIndex, memberUsername)){
                return false;
            } else {
                return true;
            }
        }
        return false;
    
    }
    const groupMembers = [{username : EMPTY, userID : EMPTY}];
    if (schedule){
        schedule.IDToNameMap.forEach((username, id) => {
            groupMembers.push({username : username, userID : id})
        })
    }
    const menuItems = groupMembers.filter((member) => checkIfMemberIsAValidReplacement(member.username)).map((item) => (
        <MenuItem value={item.username} key={item.userID}>{item.username}</MenuItem>
    ));
    return (
        <FormControl fullWidth >
            <InputLabel id="demo-simple-select-label">New Tenter</InputLabel>
            <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={newTenter}
            label="New Tenter"
            onChange={(e) => {
                if (typeof (e.target.value) === "string"){
                    setNewTenter(e.target.value);
                }
            }}
            >
            {menuItems}
            </Select>
        </FormControl>
    )
}