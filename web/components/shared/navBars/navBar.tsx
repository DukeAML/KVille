import React, {ReactNode} from 'react';
import { AppBar, Toolbar, Typography, Button, PropTypes } from '@material-ui/core';
import { useRouter } from 'next/router';



interface KvilleNavBarGivenOptionsProps {
    optionButtons : ReactNode[];
    colorIsPrimary? : boolean;
}

const KvilleNavBarGivenOptions : React.FC<KvilleNavBarGivenOptionsProps> = (props : KvilleNavBarGivenOptionsProps) => {
    let position : "sticky" | "fixed" = props.colorIsPrimary ? "sticky" : "fixed";

    return (
        <AppBar position={position} color={props.colorIsPrimary ? "primary" : "secondary"} >
            <Toolbar>
                <Typography variant="h5" style={{ flexGrow: 1 }}>
                    KVille
                </Typography>
                {props.optionButtons}
            </Toolbar>
        </AppBar>
    )
}

KvilleNavBarGivenOptions.defaultProps = {
    optionButtons : undefined,
    colorIsPrimary : true

}

export interface ButtonDescription {
    text : string;
    route : string;
}

interface KvilleNavBarGivenButtonDescriptionsProps {
    buttonDescriptions : ButtonDescription[];
    colorIsPrimary? : boolean;
}

export const KvilleNavBarGivenButtonDescriptions : React.FC<KvilleNavBarGivenButtonDescriptionsProps> = (props : KvilleNavBarGivenButtonDescriptionsProps) => {
    const router = useRouter();
    let buttons = props.buttonDescriptions.map((description, index) => {
        return (
            <Button color="inherit" onClick={() => router.push(description.route)} key={index}>{description.text}</Button>
        )
    });
    return <KvilleNavBarGivenOptions optionButtons={buttons} colorIsPrimary={props.colorIsPrimary}/>
}


KvilleNavBarGivenButtonDescriptions.defaultProps = {
    buttonDescriptions : [],
    colorIsPrimary : true
}





