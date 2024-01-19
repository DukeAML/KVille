
import { ScheduleData } from "./scheduleData";

export const FETCH_SCHEDULE_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST: "Group does not exist",
    USER_NOT_IN_GROUP: "User is not in the group",
};

export const SET_SCHEDULE_ERROR_CODES = {
    GROUP_DOES_NOT_EXIST: "Group does not exist",
    USER_NOT_IN_GROUP: "User is not in the group"
};
/**
 * @param {String[]} userIDs
 * @returns {Promise<{ userID: String, username: String }[]>}
 */

export interface UsernameAndIDs {
    userID: string;
    username: string;
}export async function fetchGroupScheduleThroughAPI(groupCode: string): Promise<ScheduleData> {
    const apiResponse = await fetch("/api/schedule/" + groupCode + "/fetchGroupSchedule", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    console.log(resJson);
    if (apiResponse.status < 300) {
        return JSONToScheduleData(resJson);
    } else {
        throw new Error("An error occurred");

    }
}
export interface ScheduleDataJSONFormat {
    IDToNameMap: { userID: string; username: string; }[];
    startDate: number;
    schedule: string[][];
}
export const scheduleDataToJson = (scheduleData: ScheduleData): ScheduleDataJSONFormat => {
    let idToNames: { userID: string; username: string; }[] = [];
    scheduleData.IDToNameMap.forEach((username, id) => {
        idToNames.push({ userID: id, username });
    });
    return { IDToNameMap: idToNames, startDate: scheduleData.startDate.getTime(), schedule: scheduleData.schedule };
};

export const JSONToScheduleData = (jsonData: ScheduleDataJSONFormat): ScheduleData => {
    let IDToNameMap = new Map<string, string>();
    jsonData.IDToNameMap.forEach((entry: { userID: string; username: string; }) => {
        IDToNameMap.set(entry.userID, entry.username);
    });
    return new ScheduleData(jsonData.schedule, new Date(jsonData.startDate), IDToNameMap);
};
export async function setGroupScheduleInDBThroughAPI(groupCode: string, newSchedule: ScheduleData): Promise<ScheduleData> {
    const apiResponse = await fetch("/api/schedule/" + groupCode + "/setGroupScheduleInDB", {
        method: "POST",
        body: JSON.stringify({ newSchedule: scheduleDataToJson(newSchedule) }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    console.log(resJson);
    if (apiResponse.status < 300) {
        return JSONToScheduleData(resJson);
    } else {
        throw new Error("An error occurred");

    }
}

