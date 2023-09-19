import React, {ReactNode} from 'react';

import {
	Button,
	Typography,
	makeStyles,
} from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
	submit: {
		margin: theme.spacing(3, 0, 2),
		fontFamily: '"TT Norms", Helvetica, Arial, "Lucida Grande", sans-serif',
		fontWeight : "bold"
	},
}));



interface ButtonInputInterface {
    onClick: ()=>void;
    text : string
}

export const KvilleButton: React.FC<ButtonInputInterface> = (props:ButtonInputInterface) => {
	const classes = useStyles();

	return (

    

    <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        onClick={props.onClick}
    >
        <Typography variant='button'>{props.text}</Typography>
    </Button>
  );
};


