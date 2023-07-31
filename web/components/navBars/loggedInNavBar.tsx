import { KvilleNavBarGivenButtonDescriptions, ButtonDescription } from "./navBar";

export const LoggedInKvilleNavBar : React.FC = () => {
    let buttonDescriptions : ButtonDescription[] = [
        {text : "Home", route : "/groups"},
        {text : "Availability", route : "/availability"},
        {text : "Group Schedule", route : "/schedule"}
    ]
    return <KvilleNavBarGivenButtonDescriptions buttonDescriptions={buttonDescriptions}/>;
}