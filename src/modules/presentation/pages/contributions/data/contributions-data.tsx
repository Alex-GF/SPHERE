import { Chip } from "@mui/material";

interface ContributionTag{
    name: string,
    color: string,
}

export interface Contribution{
    title: string,
    description: string,
    supervisor: string,
    tags: JSX.Element[],
}

function getContributionTag(name: string){

    const contributionTag: ContributionTag | undefined = contributionTags.find(tag => tag.name === name);

    if (!contributionTag) {
        return <></>;
    }else{
        return <Chip label={contributionTag.name} style={{backgroundColor: contributionTag.color}}/>;
    }
}

const contributionTags: ContributionTag[] = [
    {
        name: "Research",
        color: "#892935",
    },
    {
        name: "Cloud",
        color: "#892935",
    },
    {
        name: "Machine Learning",
        color: "#892935",
    },
    {
        name: "IT Management",
        color: "#892935",
    }
]

export const contributions: Contribution[] = [
    {
        title: "Pricing-driven Development and Operation of SaaS",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        supervisor: "José Antonio Parejo Maestre y Antonio Ruiz Cortés",
        tags: [
            getContributionTag("Research"),
            getContributionTag("Cloud"),
            getContributionTag("Machine Learning"),
            getContributionTag("IT Management"),
        ],
    },
]