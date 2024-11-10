import {Chip} from '@mui/material';

import AlejandroGarcia from "./profile-pictures/alejandro-garcia.png";
// import FranciscoJavierCavero from "./profile-pictures/francisco-javier-cavero.png";
import JoseAntonioParejo from "./profile-pictures/jose-antonio-parejo.png";
import AntonioRuiz from "./profile-pictures/antonio-ruiz.jpg";

export interface TeamMember {
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string;
    email: string;
    affiliation: JSX.Element;
    orcid?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    googlescholar?: string;
    researchGate?: string;
}

interface AffiliationType {
    name: string,
    acronym: string,
    color: string,
}

const affiliations: AffiliationType[] = [
    {
        name: 'Universidad de Sevilla',
        acronym: 'US',
        color: '#892935',
    }
]

function getAffiliation(affiliation: string) {
    
    const aff = affiliations.find(aff => aff.name === affiliation);
    
    if (!aff) {
        return <></>;
    }else{
        return (
            <Chip
              label={aff.name}
              variant="outlined"
              size="small"
              sx={{ mt: 1, backgroundColor: aff.color, color: 'white'}}
            />
        );
    }
}

export const teamMembers: TeamMember[] = [
    {
        firstName: 'Alejandro',
        lastName: 'García Fernández',
        profilePicture: AlejandroGarcia,
        role: 'PhD Student',
        email: 'agarcia29@us.es',
        affiliation: getAffiliation('Universidad de Sevilla'),
        orcid: '0009-0000-0353-8891',
        website: 'https://alejandro-garcia-fernandez.vercel.app',
        linkedin: 'https://www.linkedin.com/in/alegarfer/',
        github: 'https://github.com/Alex-GF',
        googlescholar: 'https://scholar.google.es/citations?user=g4AHBdEAAAAJ'
    },
    // {
    //     firstName: 'Francisco Javier',
    //     lastName: 'Cavero López',
    //     profilePicture: FranciscoJavierCavero,
    //     role: 'PhD Student',
    //     email: 'fcavero@us.es',
    //     affiliation: getAffiliation('Universidad de Sevilla'),
    //     orcid: '0009-0004-2453-8814',
    //     website: "https://prisma.us.es/investigador/8488",
    //     linkedin: 'https://www.linkedin.com/in/alegarfer/',
    //     github: 'https://github.com/javiercavlop',
    //     googlescholar: 'https://scholar.google.es/citations?user=vDBqkIkAAAAJ'
    // },
    {
        firstName: 'José Antonio',
        lastName: 'Parejo Maestre',
        profilePicture: JoseAntonioParejo,
        role: 'Associate Professor',
        email: 'japarejo@us.es',
        affiliation: getAffiliation('Universidad de Sevilla'),
        orcid: '0000-0002-4708-4606',
        website: 'https://prisma.us.es/investigador/3163',
        linkedin: 'https://www.linkedin.com/in/jose-antonio-parejo-maestre-a1738a8/',
        github: 'https://github.com/japarejo',
        googlescholar: 'https://scholar.google.es/citations?user=1vZmkFIAAAAJ'
    },
    {
        firstName: 'Antonio',
        lastName: 'Ruiz Cortés',
        profilePicture: AntonioRuiz,
        role: 'Full Professor',
        email: 'aruiz@us.es',
        affiliation: getAffiliation('Universidad de Sevilla'),
        orcid: '0000-0001-9827-1834',
        website: 'https://prisma.us.es/investigador/3804',
        linkedin: 'https://www.linkedin.com/in/antonioruizcortes/',
        github: 'https://github.com/antonioruizcortes',
        googlescholar: 'https://scholar.google.es/citations?user=Ka-FHBQAAAAJ'
    },
]