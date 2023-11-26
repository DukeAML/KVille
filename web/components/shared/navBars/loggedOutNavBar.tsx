import { OptionDescription, KvilleNavBarGivenOptionDescriptions } from "./navBar";

export const KvilleLoggedOutNavBar : React.FC = () => {
    let buttonDescriptions : OptionDescription[] = [
        {text : "Home", route : "/"},
        {text : "Register", route : "/register"},
        {text : "Login", route : "/login"},
        {text : "Help", route : "/"}
    ]
    return <KvilleNavBarGivenOptionDescriptions optionDescriptions={buttonDescriptions}/>;
}