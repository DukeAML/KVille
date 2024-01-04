import { useCheckIfScreenIsNarrow } from "@/lib/shared/windowProperties"
import { Grid, Typography } from "@mui/material"

interface AvailabilityGridColumnTitlesProps{
    columnTitles : string[];
}
export const AvailabilityGridColumnTitles : React.FC<AvailabilityGridColumnTitlesProps> = (props : AvailabilityGridColumnTitlesProps) => {
    const {isNarrow } = useCheckIfScreenIsNarrow();
    return (
        <Grid item container spacing={0}>
            <Grid item xs={2.5} sm={1} /> {/* Empty cell at the top-left corner */}
            {props.columnTitles.map((column, index) => (
                <Grid item xs key={index}>     
                    <Typography align="center" fontWeight={"bold"}>{column}</Typography>  
                </Grid>
            ))}
            {isNarrow ? null : <Grid item xs={2.5} sm={1} /> } {/* Empty cell at top right corner */}
        </Grid>
    )

}