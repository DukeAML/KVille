import { GracePeriod } from "../2024/gracePeriods";



export const getGracePeriods2023 = (includeDiscretionary=false) : GracePeriod[] => {
    return [
        new GracePeriod(new Date(2023, 0, 17, 16, 0), new Date(2023, 0, 17, 18, 0)),
        new GracePeriod(new Date(2023, 1, 3, 15, 30), new Date(2023, 1, 3, 18, 30))
    ];
}

