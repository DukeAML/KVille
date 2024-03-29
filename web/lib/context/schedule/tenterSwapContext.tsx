import { createContext, Context } from 'react';
import { getScheduleDates, CURRENT_YEAR } from '@/lib/schedulingAlgo/rules/scheduleDates';
import { getDatePlusNumShifts } from '../../calendarAndDatesUtils/datesUtils';
import { EMPTY } from '@/lib/schedulingAlgo/slots/tenterSlot';

interface tenterSwapContextType {
    isSwappingTenter : boolean;
    setIsSwappingTenter : (b : boolean) => void;
    timeSlotClickedOn : Date;
    setTimeSlotClickedOn : (d : Date) => void;
    tenterToReplace : string;
    setTenterToReplace : (s : string) => void;
    newTenter : string;
    setNewTenter : (s : string) => void;
    startReplacementDate : Date;
    setStartReplacementDate : (d : Date) => void;
    endReplacementDate : Date;
    setEndReplacementDate : (d : Date) => void;
    
};

export const INVALID_NEW_TENTER = "";
export const TenterSwapContext : Context<tenterSwapContextType> = createContext<tenterSwapContextType>({
    isSwappingTenter : false,
    setIsSwappingTenter : (b : boolean ) => {},
    timeSlotClickedOn : new Date(getScheduleDates(CURRENT_YEAR).startOfBlack),
    setTimeSlotClickedOn : (d : Date) => {},
    tenterToReplace : "",
    setTenterToReplace : (s : string) => {},
    newTenter : EMPTY,
    setNewTenter : (s : string) => {},
    startReplacementDate : new Date(getScheduleDates(CURRENT_YEAR).startOfBlack),
    setStartReplacementDate : (d : Date) => {},
    endReplacementDate : new Date(getDatePlusNumShifts(getScheduleDates(CURRENT_YEAR).startOfBlack, 1)),
    setEndReplacementDate : (d : Date) => {}

});