import { EMPTY } from "../slots/tenterSlot";

/**
 * Helper method at the end of schedule(). This is purely for visualization purposes. 
 * It makes the person's name aligned on the final grid
 * @param {Array<import("../slots/scheduledSlot").ScheduledSlot>} grid 
*/
export function reorganizeGrid(grid){
    for (var i = 1; i < grid.length; i++){
        var currIDs = grid[i].ids;
        var prevIDs = grid[i-1].ids;

        if (prevIDs.length != currIDs.length)
            continue;

        var newIDList = new Array(currIDs.length);

        for (var j = 0; j < prevIDs.length; j++){
            if (currIDs.includes(prevIDs[j])){
            
                newIDList[j] = prevIDs[j];
            }
        }


        for (var j = 0; j < currIDs.length; j++){
            if ((currIDs[j] != EMPTY) && (newIDList.includes(currIDs[j])))
                continue;
            else{
                //find somewhere to insert it
                for (var k = 0; k < newIDList.length; k++){
                    if (newIDList[k] == null){
                        newIDList[k] = currIDs[j];
                        break;
                    }
                }
            }
        }

        grid[i].ids = newIDList;
    }

}
