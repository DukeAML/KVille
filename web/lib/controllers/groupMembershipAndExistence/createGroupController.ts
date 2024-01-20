import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import * as Yup from "yup";


export const GROUP_CODE_LENGTH = 8;

export const CREATE_GROUP_ERROR_CODES = {
    CREATE_GROUP_FAILURE: "Failed to Create Group",
    GROUP_NAME_TAKEN: "Group Name is Already Taken"
};

export const createGroupValidationSchema = Yup.object({
    groupName: Yup.string().required('Required').min(1).max(20),
    tentType: Yup.string().required().oneOf([TENTING_COLORS.BLUE, TENTING_COLORS.BLACK, TENTING_COLORS.WHITE])
});export async function tryToCreateGroupThroughAPI(groupName: string, tentType: string): Promise<string> {
    const apiResponse = await fetch("/api/groupExistenceAndMembership/createGroup", {
        method: "POST",
        body: JSON.stringify({ groupName, tentType }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    if (apiResponse.status < 300) {

        return resJson.groupCode;
    } else {
        if (resJson.error === CREATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN) {
            throw new Error(CREATE_GROUP_ERROR_CODES.GROUP_NAME_TAKEN);
        } else {
            throw new Error(CREATE_GROUP_ERROR_CODES.CREATE_GROUP_FAILURE);
        }

    }
}

