import React, {useState} from 'react';
import { FormControl, TextField, Typography } from '@material-ui/core';
import {Button, IconButton} from '@material-ui/core';
import {Edit} from '@mui/icons-material'
import { updateName } from '../../../../common/src/db/groupExistenceAndMembership/updateGroup'
import { useQueryToFetchGroupData } from "@/lib/shared/fetchGroupData";
import { useGroupCode } from "@/lib/shared/useGroupCode";
import { useQuery } from "react-query";

interface ButtonInputInterface {
    //onClick: (newName: string, groupCode: string)=>void;
}

const divStyle = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center'
};

export const EditableGroupName: React.FC<ButtonInputInterface> = (props:ButtonInputInterface) => {

    const groupCode = useGroupCode();
    const {data : groupDescription, isLoading : isLoadingGroupDescription, isError : isErrorWithGroupDescription, refetch} = useQueryToFetchGroupData(groupCode);
    //const {data, isLoading} = useQuery('fetchingHours' +groupCode, () => fetchHoursPerPerson(groupCode));
    let [isEditing, setEditing] = useState(false);
	let [name, setName] = useState("");
	let [isError, setError] = useState(true);
	let [errorMsg, setErrorMsg] = useState("Please enter a name between 3 and 40 characters.");


    const handleEdit = () => {
        setEditing(!isEditing);
    };

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
		if (event.target.value.length < 3 || event.target.value.length > 40) {
			setError(true);
			setErrorMsg("Please enter a name between 3 and 40 characters.");
		}
		else {
			setErrorMsg("");
			setError(false);
		}
	}

    const handleSave = async () => {
		if (isError) {

		}
		else {
			await updateName(name, groupCode).then(() => {
				refetch();
			})
			setEditing(!isEditing);
		}
    }

	if (!isEditing) {
        return (
            <div style={divStyle}>
                <Typography variant="h4" align="center">{groupDescription ? groupDescription.groupName : ""}</Typography>
                <IconButton color="primary" onClick={handleEdit}>
                    <Edit/>
                </IconButton>
            </div>
        )
    }
    else {
        return (
            <div style={divStyle}>
				<FormControl style={{display: 'flex', flexDirection: 'row'}}>
					<TextField error={isError} style={{ marginBottom: 24, marginTop: 24 }} label="New group name" variant='filled'
						value={name} required={true} autoFocus helperText={errorMsg}
						onChange={handleNameChange}></TextField>
					<Button style={{ marginBottom: 24, marginTop: 24, marginLeft: 10 }} variant='contained' 
						onClick={handleEdit} disableElevation>Cancel</Button>
					<Button style={{ marginBottom: 24, marginTop: 24, marginLeft: 10}} variant='contained'
						color="primary" onClick={handleSave} disableElevation>Save</Button>
				</FormControl>
			</div>
        )
    }
};