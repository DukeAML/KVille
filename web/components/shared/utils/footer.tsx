// components/Footer.tsx
import React from 'react';
import { Container, Typography, Link } from '@mui/material';


const Footer: React.FC = () => {
    return (
        <footer>
            <Container maxWidth="lg">
                <Typography variant="body2" color="textSecondary" align="center" style={{marginBottom : 4}}>
                    Have a question? <Link href="https://forms.gle/s2PMobGpKJu26RYWA">Ask here</Link>
                </Typography>
            </Container>
        </footer>
    );
};

export default Footer;