import { KvilleNavBarGivenOptionDescriptions, OptionDescription } from "./navBar";

export const KvilleLoggedInNavBar : React.FC = () => {
    let buttonDescriptions : OptionDescription[] = [
        {text : "My Groups", route : "/groups"},
    ]
    return <KvilleNavBarGivenOptionDescriptions optionDescriptions={buttonDescriptions}/>;
}