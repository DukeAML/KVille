import { createContext, Context } from 'react';
import { GroupDescription } from '@/lib/db/groupExistenceAndMembership/groupMembership';
import { INVALID_GROUP_CODE } from '@/lib/db/groupExistenceAndMembership/GroupCode';
interface GroupContextType {
    groupDescription : GroupDescription;
    setGroupDescription : (groupDescription : GroupDescription) => void;
};


export const GroupContext : Context<GroupContextType> = createContext<GroupContextType>({
    groupDescription : new GroupDescription(INVALID_GROUP_CODE, "", "", ""),
    setGroupDescription : (g : GroupDescription) => {}
});

