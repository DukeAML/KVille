import { createContext } from 'react';

interface DateBeingShownContextType {
    dateBeingShown : Date;
    setDateBeingShown : (date : Date) => void;
};

export const DateBeingShownContext = createContext<DateBeingShownContextType>({
    dateBeingShown : new Date(Date.now()),
    setDateBeingShown : (d : Date) => {},
});