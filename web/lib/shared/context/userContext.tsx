import { createContext } from 'react';

interface UserContextType {
    userID: string;
    isLoggedIn: boolean,
    setUserID: (id: string) => void;
    setIsLoggedIn: (status: boolean) => void;
};

export const UserContext = createContext<UserContextType>({
    userID: '',
    isLoggedIn: false,
    setUserID: () => {},
    setIsLoggedIn: () => {}
});

