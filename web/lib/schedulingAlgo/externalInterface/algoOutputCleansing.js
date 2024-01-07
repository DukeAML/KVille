
/**
 * 
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} newScheduleInRange 
 * @returns {Array<Array<string>>} schedule
 */
export function scheduledSlotsArrToStringArrArr(newScheduleInRange){
    var groupScheduleArr = [];
	newScheduleInRange.forEach((scheduledSlot) => {
		groupScheduleArr.push(scheduledSlot.ids);
    });
    return groupScheduleArr;

}
