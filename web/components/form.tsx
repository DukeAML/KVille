// LoginForm.tsx

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { TextField, Typography } from '@mui/material';
import {Button} from '@material-ui/core';
import { Container } from '@material-ui/core';





interface KvilleFormProps<FormValuesInterface> {
    handleSubmit : (values : FormValuesInterface ) => void;
    initialValues : FormValuesInterface;
    validationSchema : any;
    textFields : TextFieldProps[];
    errorMessage : string;
    

}

interface TextFieldProps {
    name : string;
    type : string;
}

export const NO_ERROR_MESSAGE = "";



export const KvilleForm: React.FC<KvilleFormProps<any>> = (props:KvilleFormProps<any>) => {

    return (
    
        <Container maxWidth="sm">
            <Formik
            initialValues={props.initialValues}
            validationSchema={props.validationSchema}
            onSubmit={props.handleSubmit}
            
            >
            {() => (
                <Form>
                    {props.textFields.map((fieldProps, index) => {
                        return (
                            <div key={index}>
                                <Field
                                as={TextField}
                                type={fieldProps.type}
                                label={fieldProps.name}
                                name={fieldProps.name}
                                variant="outlined"
                                fullWidth
                                required
                                />
                                <ErrorMessage name={fieldProps.name} component="div" className="error" />
                            </div>
                        );
                    })}
                    {props.errorMessage.length > 0 ? <div>{props.errorMessage}</div> : null}

                    <Button type="submit" color="primary" variant='contained' >
                        Submit
                    </Button>
                    
                </Form>
            )}
            </Formik>
        </Container>
    
    );
};

