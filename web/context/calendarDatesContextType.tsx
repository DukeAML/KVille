export interface CalendarDatesContextType {
    calendarStartDate : Date;
    calendarEndDate : Date;
    setCalendarStartDate : (d : Date) => void;
    setCalendarEndDate : (d : Date) => void;
  };