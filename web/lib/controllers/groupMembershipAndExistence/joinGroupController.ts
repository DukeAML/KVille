import { getNumSlotsBetweenDates } from "@/lib/calendarAndDatesUtils/datesUtils";
import { getTentingStartDate } from "@/lib/calendarAndDatesUtils/tentingDates";
import { CURRENT_YEAR, getScheduleDates } from "@/lib/schedulingAlgo/rules/scheduleDates";
import * as Yup from "yup";
import { AvailabilityStatus } from "../availabilityController";
import { GroupDescription } from "./groupMembershipController";



export const JOIN_GROUP_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST: "Group does not exist",
    GROUP_IS_FULL: "Group is full already",
    ALREADY_IN: "You've already joined this group"
};

export const joinGroupValidationSchema = Yup.object({
    groupCode: Yup.string().required('Required')
});


export function getDefaultGroupMemberData(tentType: string, year = CURRENT_YEAR): { availability: AvailabilityStatus[]; availabilityStartDate: Date; } {
    let availabilityStartDate = getTentingStartDate(tentType, year);
    let endDate = getScheduleDates(year).endOfTenting;
    let numSlots = getNumSlotsBetweenDates(availabilityStartDate, endDate);
    let availability = new Array(numSlots).fill({ available: false, preferred: false });
    return { availability, availabilityStartDate };
}export async function tryToJoinGroupThroughAPI(groupCode: string, userID: string): Promise<GroupDescription> {
    const apiResponse = await fetch("/api/groupExistenceAndMembership/" + groupCode + "/joinGroup", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    if (apiResponse.status < 300) {
        return new GroupDescription(resJson.groupCode, resJson.groupName, resJson.tentType, resJson.creator);
    } else {
        throw new Error("An error occurred");
    }
}

