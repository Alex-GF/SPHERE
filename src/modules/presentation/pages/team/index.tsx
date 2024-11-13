import { Helmet } from "react-helmet";
import { teamMembers } from "./data/team-data.tsx";
import TeamMemberCard from "../../layouts/presentation-layout/components/team-member-card";
import { Box, styled } from "@mui/material";

const TeamGrid = styled(Box)(() => ({
    maxWidth: "2000px",
    width: "100dvw",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    gap: "5rem",
    margin: "auto",
    padding: "50px 15px 15px 20px",
  }));

export default function TeamPage(){
    return(
        <>
            <Helmet>
                <title> SPHERE - Team </title>
            </Helmet>
            <TeamGrid>
            {
                teamMembers.map((member) => {
                    return(
                        <TeamMemberCard member={member}/>
                    )
                })
            }
            </TeamGrid>
            
        </>
    )
}