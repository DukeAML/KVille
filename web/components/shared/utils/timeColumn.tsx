import React from "react";
import { Grid, Paper, Typography } from '@mui/material';
import { get48TimeLabels } from "../../../../common/src/calendarAndDates/calendarUtils";
export const TimeColumn : React.FC = () => {
    return (
        <Paper style={{marginTop : "20px"}}>
            <Grid container spacing={0} direction="column">
				{/* Empty cell at the top-left corner */}
				<Grid item/>

				

					
				{/* Row labels and data cells */}
				{get48TimeLabels().map((row, rowIndex) => (
					<Grid item container spacing={0} key={row}>
                        {/* Row label */}
                        <Grid item xs={1} key={row}>
                            <Typography style={{marginTop : '-12px', color : (rowIndex % 2 == 0 ? "inherit" : "transparent"), textAlign : "right", marginRight : "6px"}}>{row}</Typography>
                        </Grid>
                        
					</Grid>
				))}

            </Grid>
        </Paper>
    );
}