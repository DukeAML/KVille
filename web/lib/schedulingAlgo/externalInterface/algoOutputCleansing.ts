import { ScheduledSlot } from "../slots/scheduledSlot";


export function scheduledSlotsArrToStringArrArr(newScheduleInRange : ScheduledSlot[]) : string[][]{
    var groupScheduleArr : string[][] = [];
	newScheduleInRange.forEach((scheduledSlot) => {
		groupScheduleArr.push(scheduledSlot.ids);
    });
    return groupScheduleArr;

}
