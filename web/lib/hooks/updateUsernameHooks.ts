import { useState } from "react";
import { useMutation } from "react-query";
import { updateUsernameThroughAPI } from "../controllers/updateUsernameController";

const mutationFn = async (data : {newUsername : string}) : Promise<string> => {
    return await updateUsernameThroughAPI(data.newUsername)
}

export const NO_SUCCESS_MSG = "";
export const useMutationToUpdateUsername = () => {
    const [successMsg, setSuccessMsg] = useState<string>("");
    const {mutate, isLoading, isError, error} = useMutation(
        {
            mutationFn : mutationFn,
            onSuccess : (newUsername) => {
                setSuccessMsg("Successfully changed your name to " + newUsername);
                setTimeout(() => {
                    setSuccessMsg(NO_SUCCESS_MSG);
                }, 10000);
            }
            
        }

        
    );
    return {mutate, isLoading, isError, error, successMsg};
}