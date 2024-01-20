import { GroupMemberUserID } from "@/lib/db/groupExistenceAndMembership/groupMembership";

export class GroupDescription {

  groupCode: string;
  groupName: string;
  tentType: string;
  creator: string;

  constructor(groupCode: string, groupName: string, tentType: string, creator = "") {
    this.groupCode = groupCode;
    this.groupName = groupName;
    this.tentType = tentType;
    this.creator = creator;
  }
}

export const FETCH_GROUPS_ERRORS = {};


export const GET_GROUP_MEMBERS_ERRORS = {
  GROUP_DOES_NOT_EXIST: "Group does not exist",
};

export async function fetchGroupsThroughAPI(): Promise<GroupDescription[]> {
  const apiResponse = await fetch("/api/groupExistenceAndMembership/fetchGroups", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let resJson = await apiResponse.json();

  
  if (apiResponse.status < 300) {
    let groups : {groupCode : string, groupName : string, tentType : string, creator : string}[] = resJson.groups;
    return groups.map((group) => new GroupDescription(group.groupCode, group.groupName, group.tentType, group.creator));
  } else {
    throw new Error("An error occurred");
  }
}
export async function fetchGroupDataThroughAPI(groupCode: string): Promise<GroupDescription> {
  const apiResponse = await fetch("/api/groupExistenceAndMembership/" + groupCode + "/fetchGroupData", {
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

export async function getGroupMembersByGroupCodeThroughAPI(groupCode: string): Promise<GroupMemberUserID[]> {
  const apiResponse = await fetch("/api/groupExistenceAndMembership/" + groupCode + "/getGroupMembersByGroupCode", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  let resJson = await apiResponse.json();

  if (apiResponse.status < 300) {
    return resJson.members;
  } else {
    throw new Error("An error occurred");
  }
}

