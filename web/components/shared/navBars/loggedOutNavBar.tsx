import { ButtonDescription, KvilleNavBarGivenButtonDescriptions } from "./navBar";

export const KvilleLoggedOutNavBar : React.FC = () => {
    let buttonDescriptions : ButtonDescription[] = [
        {text : "Home", route : "/"},
        {text : "Register", route : "/register"},
        {text : "Login", route : "/login"}
    ]
    return <KvilleNavBarGivenButtonDescriptions buttonDescriptions={buttonDescriptions}/>;
}