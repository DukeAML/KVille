import { KvilleNavBarGivenOptionDescriptions, OptionDescription } from "./navBar";

export const KvilleLoggedInNavBar : React.FC = () => {
    let buttonDescriptions : OptionDescription[] = [
        {text : "My Groups", route : "/groups"},
        {text : "Join Group", route : "/groups/joinGroup"},
        {text : "Create Group", route : "/groups/createGroup"},
        {text : "Help", route : "/"},
        {text : "Profile", route : "/profile"},
        {text : "Sign Out", route : "/signOut"},
    ]
    return <KvilleNavBarGivenOptionDescriptions optionDescriptions={buttonDescriptions}/>;
}