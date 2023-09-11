import React, {ReactNode} from 'react';

import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';

interface AccordionSummaryAndDetail{
	summary : ReactNode;
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
				<Accordion key={index}>
					<AccordionSummary>
					{element.summary}
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


