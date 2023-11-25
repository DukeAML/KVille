import React, {ReactNode} from 'react';

import { Typography } from '@mui/material';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { ExpandMore } from '@mui/icons-material';
interface AccordionSummaryAndDetail{
	summaryText : string;
	detail : ReactNode;
}

interface AccordionProps {
  	elements : AccordionSummaryAndDetail[];
}


export const KvilleAccordion: React.FC<AccordionProps> = (props:AccordionProps) => {
	return (
		<div>
			{props.elements.map((element, index) => {
				return (
				<Accordion key={index} >
					<AccordionSummary expandIcon={<ExpandMore/>}>
						<Typography style={{fontWeight : "bold"}}>
							{element.summaryText}
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
					{element.detail}
					</AccordionDetails>
				</Accordion>
				)
			})}
		</div>
	);
}


