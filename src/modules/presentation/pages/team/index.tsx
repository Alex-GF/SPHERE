import { Helmet } from "react-helmet";
import { teamMembers } from "./data/team-data";
import TeamMemberCard from "../../layouts/presentation-layout/components/team-member-card";
export default function TeamPage(){
    return(
        <>
            <Helmet>
                <title> SPHERE - Team </title>
            </Helmet>
            {
                teamMembers.map((member) => {
                    return(
                        <TeamMemberCard member={member}/>
                    )
                })
            }
            
        </>
    )
}