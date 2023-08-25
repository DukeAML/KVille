import { KvilleNavBarGivenButtonDescriptions, ButtonDescription } from "./navBar";

export const KvilleLoggedInNavBar : React.FC = () => {
    let buttonDescriptions : ButtonDescription[] = [
        {text : "My Groups", route : "/groups"},
    ]
    return <KvilleNavBarGivenButtonDescriptions buttonDescriptions={buttonDescriptions}/>;
}