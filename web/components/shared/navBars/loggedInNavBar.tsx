import { KvilleNavBarGivenOptionDescriptions, OptionDescription } from "./navBar";

export const KvilleLoggedInNavBar : React.FC = () => {
    let buttonDescriptions : OptionDescription[] = [
        {text : "My Groups", route : "/groups"},
        {text : "Help", route : "/"},
        {text : "Sign Out", route : "/signOut"},
    ]
    return <KvilleNavBarGivenOptionDescriptions optionDescriptions={buttonDescriptions}/>;
}