import React from "react";
import { FormControl, Select, MenuItem, InputLabel } from "@material-ui/core";
import { TENTING_COLORS } from "../../../../../common/data/phaseData";

interface SelectTentTypeProps {
    tentType : string;
    setTentType : (t : string) => void;
}
export const SelectTentType : React.FC<SelectTentTypeProps> = (props : SelectTentTypeProps) => {
    return (
        <FormControl fullWidth style={{marginTop : 8, marginBottom : 8}}>
            <InputLabel id="tentTypeSelectLabel">Tent Type</InputLabel>
            <Select
                labelId="tentTypeSelectLabel"
                id="tentTypeSelect"
                value={props.tentType}
                label="New Tenter"
                onChange={(e) => {
                    if (typeof (e.target.value) === "string"){
                        props.setTentType(e.target.value);
                    }
                }}
                >
                {[TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, TENTING_COLORS.WHITE].map((type) => {
                    return (
                        <MenuItem value={type} key={type}>{type}</MenuItem>
                    )
                })}
            </Select>

        </FormControl>
    )

}