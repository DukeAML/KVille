import { phaseData2023 } from "../../../data/2023/phaseData"
import { phaseData2024 } from "../../../data/2024/phaseData";



export const TENTING_COLORS = {
    BLACK : "Black",
    BLUE : "Blue",
    WHITE : "White"
}

/**
 * 
 * @param {number} year 
 * @returns {{Black : {day : number, night : number}, Blue : {day : number, night : number}, White : {day : number, night : number}}}
 */
export const getPhaseData = (year) => {
    if (year < 2023.5){
        return phaseData2023;
    } else {
        return phaseData2024;
    }
}