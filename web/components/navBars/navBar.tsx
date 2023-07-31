import React, {ReactNode} from 'react';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { useRouter } from 'next/router';



interface KvilleNavBarGivenOptionsProps {
    optionButtons : ReactNode[];

}

const KvilleNavBarGivenOptions : React.FC<KvilleNavBarGivenOptionsProps> = (props : KvilleNavBarGivenOptionsProps) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                My App
                </Typography>
                {props.optionButtons}
            </Toolbar>
        </AppBar>
    )
}

export interface ButtonDescription {
    text : string;
    route : string;
}

interface KvilleNavBarGivenButtonDescriptionsProps {
    buttonDescriptions : ButtonDescription[];
}

export const KvilleNavBarGivenButtonDescriptions : React.FC<KvilleNavBarGivenButtonDescriptionsProps> = (props : KvilleNavBarGivenButtonDescriptionsProps) => {
    const router = useRouter();
    let buttons = props.buttonDescriptions.map((description, index) => {
        return (
            <Button color="inherit" onClick={() => router.push(description.route)} key={index}>{description.text}</Button>
        )
    });
    return <KvilleNavBarGivenOptions optionButtons={buttons}/>
}





