import React, {ReactNode} from 'react';
import { AppBar, Toolbar, Typography, Button, PropTypes } from '@material-ui/core';
import { useRouter, NextRouter } from 'next/router';
import { useCheckIfScreenIsNarrow } from '@/lib/hooks/windowProperties';
import { MobileNavBarDrawerAndMenuIcon } from './mobileNavBar';




interface KvilleNavBarGivenOptionsProps {
    options : ReactNode;
    colorIsPrimary? : boolean;
}

const KvilleNavBarGivenOptions : React.FC<KvilleNavBarGivenOptionsProps> = (props : KvilleNavBarGivenOptionsProps) => {
    let position : "sticky" | "fixed" = props.colorIsPrimary ? "sticky" : "fixed";
    const router = useRouter();
    return (
        <AppBar position={position} color={props.colorIsPrimary ? "primary" : "secondary"} >
            <Toolbar>
                <Typography variant="h5" style={{ flexGrow: 1, cursor : "pointer" }} onClick={() => router.push("/")}>
                    Shift Scheduler
                </Typography>
                {props.options}
            </Toolbar>
        </AppBar>
    )
}

KvilleNavBarGivenOptions.defaultProps = {
    options : undefined,
    colorIsPrimary : true

}

export interface OptionDescription {
    text : string;
    route : string;
}

interface KvilleNavBarGivenOptionDescriptionsProps {
    optionDescriptions : OptionDescription[];
    colorIsPrimary? : boolean;
}

export const KvilleNavBarGivenOptionDescriptions : React.FC<KvilleNavBarGivenOptionDescriptionsProps> = (props : KvilleNavBarGivenOptionDescriptionsProps) => {
    const router = useRouter();
    return <KvilleNavBarGivenOptions options={DescriptionsToOptions(props.optionDescriptions, router)} colorIsPrimary={props.colorIsPrimary}/>
}



KvilleNavBarGivenOptionDescriptions.defaultProps = {
    optionDescriptions : [],
    colorIsPrimary : true, 
}

export const DescriptionsToOptions = (optionDescriptions : OptionDescription[], router : NextRouter) : ReactNode => {
    const {isNarrow, checkingIfNarrow} = useCheckIfScreenIsNarrow();
    if (checkingIfNarrow){
        return null;
    } else if (isNarrow){
        return <MobileNavBarDrawerAndMenuIcon optionDescriptions={optionDescriptions}/>
    } else {
        return (
            <div>
                {optionDescriptions.map((description, index) => {
                    return (
                        <Button color="inherit" onClick={() => router.push(description.route)} key={description.route}>{description.text}</Button>
                    )
                })}
            </div>
        );
    }
    
}



