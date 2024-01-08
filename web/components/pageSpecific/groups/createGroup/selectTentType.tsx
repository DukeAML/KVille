import React, {useState} from "react";
import { FormControl, Select, MenuItem, InputLabel, OutlinedInput } from "@mui/material";
import { TENTING_COLORS } from "@/lib/schedulingAlgo/rules/phaseData";
import { makeStyles } from "@material-ui/core";


interface SelectTentTypeProps {
    tentType : string;
    setTentType : (t : string) => void;
}


export const SelectTentType : React.FC<SelectTentTypeProps> = (props : SelectTentTypeProps) => {

    return (
        <>
        <FormControl fullWidth style={{marginTop : 8, marginBottom : 8}}>
            <InputLabel id="tentTypeSelectLabel">Tent Type</InputLabel>
            <Select
                labelId="tentTypeSelectLabel"
                id="tentTypeSelect"
                value={props.tentType}
                label="Tent Type"
                multiline={true}
                rows={3}
                onChange={(e) => {
                    if (typeof (e.target.value) === "string"){
                        props.setTentType(e.target.value);
                    }
                }}
                >
                {[TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, TENTING_COLORS.WHITE].map((type) => {
                    return (
                        <MenuItem style={{whiteSpace : "pre"}}  value={type} key={type}>{" " + type + " "}</MenuItem>
                    )
                })}
            </Select>

        </FormControl>
        </>
    )

}