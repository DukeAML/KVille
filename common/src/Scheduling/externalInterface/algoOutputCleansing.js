
/**
 * 
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} newScheduleInRange 
 * @param {{[key : string] : string}} idToName
 */
export function slotsArrToStringArr(newScheduleInRange, idToName){
    var groupScheduleArr = [];
	for (var i = 0; i < newScheduleInRange.length; i++){
		var ids = newScheduleInRange[i].ids;
		var names = "";
		for (var j = 0; j < ids.length; j++){
		names = names + idToName[ids[j]] + " ";
		}
		if (names.endsWith(" ")){
		names = names.substring(0, names.length -1);
		}
		groupScheduleArr.push(names);
    }
    return groupScheduleArr;

}
