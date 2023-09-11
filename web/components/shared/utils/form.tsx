// LoginForm.tsx

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { MenuItem, Select, TextField, Typography } from '@mui/material';
import {Button} from '@mui/material';
import { Container } from '@material-ui/core';





interface KvilleFormProps<FormValuesInterface> {
    handleSubmit : (values : FormValuesInterface ) => void;
    initialValues : FormValuesInterface;
    validationSchema : any;
    textFields? : TextFieldProps[];
    selectFields? : SelectFieldProps[];
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
                                <div key={index} style={{marginBottom : 4}}>
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

                        {props.selectFields?.map((fieldProps, index) => {
                            return (
                                <div key={index}>
                                    <Field
                                        as={Select}
                                        id={fieldProps.name}
                                        name={fieldProps.name}
                                        label={fieldProps.name}
                                        variant="outlined"
                                        fullWidth
                                        required
                                    >
                                        {fieldProps.options.map((option, index) => {
                                            return (
                                                <MenuItem key={option} value={option}>
                                                    {option}
                                                </MenuItem>
                                            );
                                        })}


                                    </Field>
                                </div>
                            )
                        })

                        }
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

