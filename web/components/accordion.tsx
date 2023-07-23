import * as React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';


export const KvilleAccordion: React.FC = () => {
  return (
    <div>
      <Accordion>
        <AccordionSummary >
          <Typography>Dropdown 1</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Content for Dropdown 1
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary>
          <Typography>Dropdown 2</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Content for Dropdown 2
          </Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}


