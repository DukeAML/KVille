import { createContext, Context } from 'react';
import { scheduleDates } from '../../../../common/data/scheduleDates';
import { getDatePlusNumShifts } from '../../../../common/src/calendarAndDates/datesUtils';
import { EMPTY } from '../../../../common/src/scheduling/slots/tenterSlot';

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
    timeSlotClickedOn : new Date(scheduleDates.startOfBlack),
    setTimeSlotClickedOn : (d : Date) => {},
    tenterToReplace : "",
    setTenterToReplace : (s : string) => {},
    newTenter : EMPTY,
    setNewTenter : (s : string) => {},
    startReplacementDate : new Date(scheduleDates.startOfBlack),
    setStartReplacementDate : (d : Date) => {},
    endReplacementDate : new Date(getDatePlusNumShifts(scheduleDates.startOfBlack, 1)),
    setEndReplacementDate : (d : Date) => {}

});