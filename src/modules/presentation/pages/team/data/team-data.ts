interface TeamMember {
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string;
    email: string;
    affiliation: string;
    orcid?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    googlescholar?: string;
    researchGate?: string;
}

export const teamMembers: TeamMember[] = [
    {
        firstName: 'Alejandro',
        lastName: 'García-Fernández',
        profilePicture: "test",
        role: 'Chief Executive Officer',
        email: 'agarcia29@us.es',
        affiliation: 'Universidad de Sevilla',
        orcid: '0009-0000-0353-8891',
        website: 'https://alejandro-garcia-fernandez.vercel.app',
        linkedin: 'https://www.linkedin.com/in/alegarfer/',
        github: 'https://github.com/Alex-GF',
        googlescholar: 'https://scholar.google.es/citations?user=g4AHBdEAAAAJ&hl=es&oi=ao'
    }
]