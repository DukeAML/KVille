import { Typography } from "@mui/material"

interface ErrorMessageProps {
    msg : string;
}
export const ErrorMessage : React.FC<ErrorMessageProps> = (props : ErrorMessageProps) => {
    return (
        <Typography color="red" style={{marginBottom : 8, marginTop : 8}}>{props.msg}</Typography>
    )
}
