import { useState, useEffect } from "react";

export function isBrowser() {
    return typeof window !== "undefined";
}

export interface windowProperties {
    width : number;
    isBrowser : boolean;
    isNarrow : boolean;
}
export function getWindowProperties() {
    if (typeof window === "undefined"){
        return {
            width : 1,
            isBrowser : false,
            isNarrow : false
        }
    } else {
        let width = window.innerWidth;
        return {
            width : width,
            isBrowser : true,
            isNarrow : width < 1000
        }
    }
}


export function useCheckIfScreenIsNarrow() : {isNarrow : boolean, checkingIfNarrow : boolean} {
    const [isNarrow, setIsMobile] = useState<boolean>(false);
    const [checkingIfNarrow, setCheckingIfNarrow] = useState<boolean>(true);
    useEffect(() => {
        setIsMobile(getWindowProperties().isNarrow);
        setCheckingIfNarrow(false);
    }, []);
    return {isNarrow, checkingIfNarrow}
}
