import { phaseData2023 } from "../../data/2023/phaseData"
import { phaseData2024 } from "../../data/2024/phaseData";



export const TENTING_COLORS = {
    BLACK : "Black",
    BLUE : "Blue",
    WHITE : "White"
}


interface DayAndNightInterface{
    day : number;
    night : number;
}
interface PhaseDataInterface{
    Black : DayAndNightInterface;
    Blue : DayAndNightInterface;
    White : DayAndNightInterface;

}
export const getPhaseData = (year : number) : PhaseDataInterface => {
    if (year < 2023.5){
        return phaseData2023;
    } else {
        return phaseData2024;
    }
}