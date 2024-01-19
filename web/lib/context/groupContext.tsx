import { createContext, Context } from 'react';
import { GroupDescription } from "../controllers/groupMembershipAndExistence/groupMembershipController";
import { INVALID_GROUP_CODE } from "../controllers/groupMembershipAndExistence/groupCodeController";
interface GroupContextType {
    groupDescription : GroupDescription;
    setGroupDescription : (groupDescription : GroupDescription) => void;
};


export const GroupContext : Context<GroupContextType> = createContext<GroupContextType>({
    groupDescription : new GroupDescription(INVALID_GROUP_CODE, "", "", ""),
    setGroupDescription : (g : GroupDescription) => {}
});

