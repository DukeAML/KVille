import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import * as Yup from "yup";

export const UPDATE_GROUP_ERROR_CODES = {
    UPDATE_GROUP_FAILURE: "Unknown Error",
    GROUP_NAME_TAKEN: "Group Name is Already Taken",
    USER_NOT_IN_GROUP: "You must be a member of the group"
};

export const createGroupValidationSchema = Yup.object({
    groupName: Yup.string().required('Required'),
    tentType: Yup.string().required().oneOf([TENTING_COLORS.BLUE, TENTING_COLORS.BLACK, TENTING_COLORS.WHITE])
});export async function updateGroupNameThroughAPI(newGroupName: string, groupCode: string): Promise<string> {
    const apiResponse = await fetch("/api/groupExistenceAndMembership/" + groupCode + "/updateGroupName", {
        method: "POST",
        body: JSON.stringify({ newGroupName }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    if (apiResponse.status < 300) {

        return resJson.newGroupName;
    } else {
        if (resJson.error === UPDATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN) {
            throw new Error(UPDATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN);
        } else if (resJson.error === UPDATE_GROUP_ERROR_CODES.UPDATE_GROUP_FAILURE) {
            throw new Error(UPDATE_GROUP_ERROR_CODES.UPDATE_GROUP_FAILURE);
        } else if (resJson.error === UPDATE_GROUP_ERROR_CODES.USER_NOT_IN_GROUP) {
            throw new Error(UPDATE_GROUP_ERROR_CODES.USER_NOT_IN_GROUP);
        } else {
            throw new Error("An error occurred");
        }

    }
}

