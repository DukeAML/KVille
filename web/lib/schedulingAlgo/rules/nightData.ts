import { isNight2024 } from "@/lib/data/2024/nightData";
import { isNight2023 } from "@/lib/data/2023/nightData";
export const nightData = {nightStartHour: 2, nightEndHour: 7}


export const isNight = (date : Date) : boolean => {
    let year = date.getFullYear();
    if (year < 2023.5){
        return isNight2023(date);
    } else {
        return isNight2024(date);
    }

}