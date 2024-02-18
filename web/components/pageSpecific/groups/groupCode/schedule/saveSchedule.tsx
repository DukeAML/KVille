import React from 'react';
import * as XLSX from 'xlsx';
import { useGroupCode } from "@/lib/hooks/useGroupCode"
import { useQueryToFetchSchedule } from "@/lib/hooks/scheduleHooks"
import { getDatePlusNumShifts } from "@/lib/calendarAndDatesUtils/datesUtils"

const ExportToExcel = ({ data }) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "sheet1");
    XLSX.writeFile(wb, `test.xlsx`);
  };
  return (
    <button onClick={exportToExcel}>
      Export to Excel
    </button>
  );
};
// Example usage in your component
export const SaveSchedule : React.FC = () => {
    const groupCode = useGroupCode();
    const {data} = useQueryToFetchSchedule(groupCode);
    if (data) {
        const startDate = data.startDate;
        let i = 0;
        let weekNo = 1;
        let headerRow = {}; // needs to be fixed

        while (i <= Math.ceil(data.schedule.length / 48)) {
            if (i % 7 == 0) {
                let weekTitle = `Week ${weekNo} Times`;
                //headerRow[weekTitle] = [];
            }
            let currentDate = getDatePlusNumShifts(startDate, i*48);
            console.log(currentDate.toDateString());
            let week = {header1: "startTimes"}
            i++;
        }
        /*for (let i = 0; i < 5; i++) {
            let names = data.getNamesAtTimeIndex(i);
            console.log(getDatePlusNumShifts(startDate, i));
            console.log(names);
        }*/
        console.log(headerRow);
    }
  return (
    <div>
      <ExportToExcel data={data}/>
    </div>
  );
};