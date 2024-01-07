export const nightData = {nightStartHour: 2, nightEndHour: 7}


export const isNight2023 = (date : Date) : boolean => {
    let hour = date.getHours();
    if (hour >= 1.99 && hour < 6.99){
        return true;
    } else {
        return false;
    }
}