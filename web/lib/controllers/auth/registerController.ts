
import * as Yup from "yup";


export const authValidationSchema = Yup.object({
    username: Yup.string()
        .matches(/^[a-zA-Z0-9._%+-]+$/, 'Username must be a valid email prefix') // Allow alphanumeric characters, dots, underscores, percent signs, plus signs, and hyphens
        .required('Required')
        .min(1)
        .max(20)
        .test(
            'is-gmail-username',
            'Username must be a valid email prefix',
            (value) => validateEmail(value + EMAIL_SUFFIX)
        ),
    password: Yup.string().required('Required').min(6),
});
function validateEmail(email: string): boolean {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email);
}export const REGISTER_ERROR_CODES = {
    USERNAME_TAKEN: "Username is taken",
    DEFAULT: "An error occurred"
};

export const EMAIL_SUFFIX = "@gmail.com";
export async function registerThroughAPI(username: string, password: string): Promise<string> {
    const apiResponse = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    if (apiResponse.status < 300) {
        return resJson.userID;
    } else {
        throw new Error(resJson.error);

    }
}

