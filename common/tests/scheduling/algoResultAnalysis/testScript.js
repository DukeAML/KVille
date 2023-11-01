import { scheduleAlgorithm} from "../../src/scheduling/algorithm";
import { Person } from "../../src/scheduling/person";
import { TenterSlot, TENTER_STATUS_CODES, EMPTY } from "../../src/scheduling/slots/tenterSlot";

import { getDatePlusNumShifts } from "../../src/calendarAndDates/datesUtils";
import { TENTING_COLORS} from "../../data/phaseData";

const p1 = new Person("p1", "p1", 38, 10, 0, 0);
const p2 = new Person("p2", "p2", 38, 10, 0, 0);
let people = [p1, p2];
let startDate = new Date(2023, 0, 15, 0, 0);
let PHASE = TENTING_COLORS.BLUE;
const tenterSlotsGrid = [[], []];
for (let i = 0; i < 1; i+=1){
    tenterSlotsGrid[0][i] = new TenterSlot("p1", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 0);
    tenterSlotsGrid[1][i] = new TenterSlot("p2", getDatePlusNumShifts(startDate, i), PHASE, TENTER_STATUS_CODES.AVAILABLE, i, 1);
}

const schedule = scheduleAlgorithm(people, tenterSlotsGrid);
