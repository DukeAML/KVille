import { createContext } from 'react';

interface AvailabilityPageContextType {
	calendarStartDate: Date;
	calendarEndDate: Date;
	setCalendarStartDate: (d: Date) => void;
	setCalendarEndDate: (d: Date) => void;
	settingPreferred: boolean;
	setSettingPreferred: (b: boolean) => void;

}

export const AvailabilityPageContext = createContext<AvailabilityPageContextType>({
	calendarStartDate: new Date(2024, 0, 15),
	calendarEndDate: new Date(2024, 0, 20),
	setCalendarStartDate: (d: Date) => { },
	setCalendarEndDate: (d: Date) => { },
	settingPreferred: false,
	setSettingPreferred: (b: boolean) => { }
});
