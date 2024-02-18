export const updateUsernameThroughAPI = async (newUsername : string)=> {4
    const apiResponse = await fetch("/api/updateUsername", {
        method: "POST",
        body: JSON.stringify({ newUsername : newUsername }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();

    if (apiResponse.status < 300) {
        return newUsername;
    } else {
        //get the right error message if usernaem is taken!!!!
        throw new Error("An error occurred - the new username might be taken already");

    }
}