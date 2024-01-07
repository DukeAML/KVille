export const getQueryKeyNameForFetchAvailability = (groupCode : string, userID : string) =>  {
    return "fetchAvailabilty" + groupCode + "" + userID;
}