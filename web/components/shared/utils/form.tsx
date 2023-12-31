// LoginForm.tsx

import React, {ReactNode} from 'react';
import { Formik, Form, Field, ErrorMessage} from 'formik';
import {  TextField, Typography, Container } from '@mui/material';
import {Select, MenuItem, InputLabel, FormControl} from '@mui/material';
import {Button} from '@material-ui/core';







interface KvilleFormProps<FormValuesInterface> {
    handleSubmit : (values : FormValuesInterface ) => void;
    initialValues : FormValuesInterface;
    validationSchema : any;
    textFields? : TextFieldProps[];
    extraStuff? : ReactNode;
    errorMessage : string;
    

}

interface TextFieldProps {
    name : string;
    type : string;
}

interface SelectFieldProps {
    name : string;
    options : string[];
}

export const NO_ERROR_MESSAGE = "";



export const KvilleForm: React.FC<KvilleFormProps<any>> = (props:KvilleFormProps<any>) => {

    return (
    
        <Container maxWidth="sm">
            <Formik
                initialValues={props.initialValues}
                validationSchema={props.validationSchema}
                onSubmit={(values : any) => {
                    console.log("form was psubmitted");
                    props.handleSubmit(values);
                }}
            >
                {() => (
                    <Form>
                        {props.textFields?.map((fieldProps, index) => {
                            return (
                                <div key={index} style={{marginBottom : 8}}>
                                    <Field
                                        as={TextField}
                                        type={fieldProps.type}
                                        label={fieldProps.name}
                                        name={fieldProps.name}
                                        variant="outlined"
                                        fullWidth
                                        required
                                    />
                                    <ErrorMessage name={fieldProps.name} component="Typography" />
                                </div>
                            );
                        })}

                        {props.extraStuff ? props.extraStuff : null}
                        
                        {props.errorMessage.length > 0 ? <div>{props.errorMessage}</div> : null}

                        <Button type="submit" color="primary" variant="contained">
                            Submit
                        </Button>
                        
                    </Form>
                )}
            </Formik>
        </Container>
    
    );
};

