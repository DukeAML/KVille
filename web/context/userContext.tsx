import { createContext } from 'react';

interface UserContextType {
  userID: string;
  groupCode: string;
  isLoggedIn: boolean,
  setUserID: (id: string) => void;
  setGroupCode: (group: string) => void;
  setIsLoggedIn: (status: boolean) => void;
};

export const UserContext = createContext<UserContextType>({
  userID: '',
  groupCode: '',
  isLoggedIn: false,
  setUserID: () => {},
  setGroupCode: () => {},
  setIsLoggedIn: () => {}
});

