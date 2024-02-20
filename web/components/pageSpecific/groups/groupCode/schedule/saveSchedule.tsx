import React from 'react';
import * as XLSX from 'xlsx';
import { useGroupCode } from "@/lib/hooks/useGroupCode"
import { useQueryToFetchSchedule } from "@/lib/hooks/scheduleHooks"
import { getDatePlusNumShifts, getDayAbbreviation, getNumSlotsBetweenDates } from "@/lib/calendarAndDatesUtils/datesUtils"
import { ScheduleData } from '@/lib/controllers/scheduleData';
import { getTimeLabel } from '@/lib/calendarAndDatesUtils/calendarUtils';
import { Button } from '@mui/material';

const ExportToExcel = ({ data  } : {data : any}) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sheet1");
    XLSX.writeFile(wb, `Tent_Shift_Schedule.xlsx`);
  };
  return (
    <Button variant="contained" color="primary" onClick={exportToExcel}>
      Export to Excel
    </Button>
  );
};

type OneRowData = { [key: string]: any};
type DataRows = OneRowData[];

const getDataFormattedForExcel = (scheduleData : ScheduleData) : DataRows => {
  let scheduleStartDate = scheduleData.startDate;
  let startDateAtMidnight = new Date(scheduleStartDate.getFullYear(), scheduleStartDate.getMonth(), scheduleStartDate.getDate(), 0, 0);
  let initialHoursOffset = getNumSlotsBetweenDates(startDateAtMidnight, scheduleStartDate);
  let dataRows : DataRows = [];
  for (let hoursIndex = 0; hoursIndex < 48; hoursIndex += 1){
    let scheduleTimeIndex = hoursIndex - initialHoursOffset;
    let dayIndex = 0;
    let newRow : OneRowData  = {}
    while (scheduleTimeIndex < scheduleData.schedule.length){
      let date = getDatePlusNumShifts(scheduleStartDate, scheduleTimeIndex);
      if (dayIndex % 7 === 0){
        let colTitle = "Week " + (Math.floor(dayIndex / 7) + 1).toString();
        let paddingColumn = "";
        for (let paddingIncrementer = 0; paddingIncrementer < (dayIndex / 7); paddingIncrementer += 1){
          paddingColumn = paddingColumn + " ";
        }
        if (dayIndex > 0){
          newRow[paddingColumn] = "";
        }
        
        newRow[colTitle] = getTimeLabel(hoursIndex);
      }
      let dayLabel = getDayAbbreviation(date);
      let names = "N/A";
      if (scheduleTimeIndex < scheduleData.schedule.length && scheduleTimeIndex >= 0){
        newRow[dayLabel] = scheduleData.getNamesAtTimeIndex(scheduleTimeIndex).join(", ");
      } else {
        newRow[dayLabel] = "N/A";
      }
      
      dayIndex += 1;
      scheduleTimeIndex += 48;

    }
    dataRows.push(newRow);

  }
  return dataRows;
}
export const SaveSchedule : React.FC = () => {
    const groupCode = useGroupCode();
    const {data} = useQueryToFetchSchedule(groupCode);
    if (data){
      let rowsData = getDataFormattedForExcel(data);
      return (
        <div>
          <ExportToExcel data={rowsData}/>
        </div>
      );
    } else {
      return null;
    }
};