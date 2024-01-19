

export const REMOVE_USER_ERRORS = {
  USER_DOES_NOT_EXIST: "User does not exist",
  USER_NOT_IN_GROUP: "User is not in group",
  GROUP_DOES_NOT_EXIST: "Group does not exist",
  CANNOT_REMOVE_CREATOR: "Cannot remove group creator",
  DEFAULT: "Error removing user",
};export async function removeMemberFromGroupByUsernameThroughAPI(username: string, groupCode: string) {
  const apiResponse = await fetch("/api/groupExistenceAndMembership/" + groupCode + "/removeMemberFromGroupByUsername", {
    method: "POST",
    body: JSON.stringify({ username }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  let resJson = await apiResponse.json();
  if (apiResponse.status < 300) {
  } else {
    if (resJson.error === REMOVE_USER_ERRORS.CANNOT_REMOVE_CREATOR) {
      throw new Error(REMOVE_USER_ERRORS.CANNOT_REMOVE_CREATOR);
    } else if (resJson.error === REMOVE_USER_ERRORS.USER_DOES_NOT_EXIST) {
      throw new Error(REMOVE_USER_ERRORS.USER_DOES_NOT_EXIST);
    } else if (resJson.error === REMOVE_USER_ERRORS.USER_NOT_IN_GROUP) {
      throw new Error(REMOVE_USER_ERRORS.USER_NOT_IN_GROUP);
    } else if (resJson.error === REMOVE_USER_ERRORS.GROUP_DOES_NOT_EXIST) {
      throw new Error(REMOVE_USER_ERRORS.GROUP_DOES_NOT_EXIST);
    } else {
      throw new Error(REMOVE_USER_ERRORS.DEFAULT);
    }

  }
}

