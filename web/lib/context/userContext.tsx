import { createContext } from 'react';

interface UserContextType {
    userID: string;
    isLoggedIn: boolean,
    triedToLogIn : boolean,
    setUserID: (id: string) => void;
    setIsLoggedIn: (status: boolean) => void;
    setTriedToLogIn : (tried : boolean) => void;
};

export const UserContext = createContext<UserContextType>({
    userID: '',
    isLoggedIn: false,
    triedToLogIn : false,
    setUserID: () => {},
    setIsLoggedIn: () => {},
    setTriedToLogIn : () => {}
});

