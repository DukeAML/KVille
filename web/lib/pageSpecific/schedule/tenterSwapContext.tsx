import { createContext, Context } from 'react';

interface tenterSwapContextType {
    isSwappingTenter : boolean;
    setIsSwappingTenter : (b : boolean) => void;
    timeSlotClickedOn : Date;
    setTimeSlotClickedOn : (d : Date) => void;
    tenterToReplace : string;
    setTenterToReplace : (s : string) => void;
};

export const TenterSwapContext : Context<tenterSwapContextType> = createContext<tenterSwapContextType>({
    isSwappingTenter : false,
    setIsSwappingTenter : (b : boolean ) => {},
    timeSlotClickedOn : new Date(2023, 0, 0, 0, 0),
    setTimeSlotClickedOn : (d : Date) => {},
    tenterToReplace : "",
    setTenterToReplace : (s : string) => {}

});