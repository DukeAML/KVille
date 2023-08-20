import { createContext, Context } from 'react';
import { GroupDescription } from '../../common/db/groupMembership';

interface GroupContextType {
    groupDescription : GroupDescription;
    setGroupDescription : (groupDescription : GroupDescription) => void;
};

export const GroupContext : Context<GroupContextType> = createContext<GroupContextType>({
    groupDescription : new GroupDescription("", "", ""),
    setGroupDescription : (g : GroupDescription) => {}
});
