export const AVAILABILITY_ERROR_CODES = {
    FETCH_ERROR: "Error Fetching Availability",
    UPDATE_ERROR: "Error Setting Availability"
};

export interface AvailabilityStatus {
    available: boolean;
    preferred: boolean;
}

export class AvailabilitySlot {
    startDate: Date;
    available: boolean;
    preferred: boolean;

    constructor(startDate: Date, available: boolean, preferred = false) {
        this.startDate = startDate;
        this.available = available;
        this.preferred = preferred;
    }
}
export async function setDBAvailabilityThroughAPI(groupCode: string, newAvailability: AvailabilitySlot[]) {
    const apiResponse = await fetch("/api/availability/" + groupCode + "/setDBAvailability", {
        method: "POST",
        body: JSON.stringify({ availability: availabilitySlotsToJSON(newAvailability) }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    if (apiResponse.status < 300) {
    } else {
        throw new Error("An error occurred");

    }
}
interface JSONAvailabilitySlot {
    available: boolean;
    preferred: boolean;
    startDate: number;
}
export const availabilitySlotsToJSON = (slots: AvailabilitySlot[]): JSONAvailabilitySlot[] => {
    return slots.map((slot) => {
        return {
            available: slot.available,
            preferred: slot.preferred,
            startDate: slot.startDate.getTime()
        };
    });
};

export const JSONToAvailabilitySlots = (slots: JSONAvailabilitySlot[]): AvailabilitySlot[] => {
    return slots.map((slot) => {
        return {
            available: slot.available,
            preferred: slot.preferred,
            startDate: new Date(slot.startDate)
        };
    });
};
export async function fetchAvailabilityThroughAPI(groupCode: string): Promise<AvailabilitySlot[]> {
    const apiResponse = await fetch("/api/availability/" + groupCode + "/fetchAvailability", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    if (apiResponse.status < 300) {
        return JSONToAvailabilitySlots(resJson.availability);
    } else {
        throw new Error("An error occurred");

    }
}

