import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { useRouter } from 'next/router';

export const KvilleNavBar: React.FC = () => {
    const router = useRouter();
    return (
        <AppBar position="static">
        <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
            My App
            </Typography>
            <Button color="inherit" onClick={() => router.push("/groups")}>Home</Button>
            <Button color="inherit" onClick={() => router.push("/availability")}>My Availability</Button>
            <Button color="inherit" onClick={() => router.push("/schedule")}>Group Schedule</Button>
        </Toolbar>
        </AppBar>
    );
}


