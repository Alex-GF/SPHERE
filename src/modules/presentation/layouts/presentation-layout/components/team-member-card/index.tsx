import {
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Box,
  Chip,
  styled,
} from '@mui/material';
import { MdEmail, MdLanguage } from 'react-icons/md';
import { FaLinkedin, FaTwitter, FaGithub, FaSchool } from 'react-icons/fa';
import { AiOutlineProject } from 'react-icons/ai';

interface TeamMember {
  firstName: string;
  lastName: string;
  profilePicture?: string;
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

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 500,
  margin: 'auto',
  transition: '0.3s',
  boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
  '&:hover': {
    boxShadow: '0 16px 70px -12.125px rgba(0,0,0,0.3)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 250,
  height: 250,
  margin: '20px auto',
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
}));

const StyledCardContent = styled(CardContent)({
  textAlign: 'center',
});

const SocialIcons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(2),
}));

export default function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <StyledCard>
      <StyledAvatar
        src={member.profilePicture}
        alt={`${member.firstName} ${member.lastName}`}
      >
        {!member.profilePicture && `${member.firstName[0]}${member.lastName[0]}`}
      </StyledAvatar>
      <StyledCardContent>
        <Typography gutterBottom variant="h5" component="div">
          {member.firstName} {member.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {member.role}
        </Typography>
        <Chip
          label={member.affiliation}
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
        />
        <SocialIcons>
          <Tooltip title="Email">
            <IconButton href={`mailto:${member.email}`} aria-label="Email">
              <MdEmail />
            </IconButton>
          </Tooltip>
          {member.website && (
            <Tooltip title="Website">
              <IconButton href={member.website} target="_blank" rel="noopener noreferrer" aria-label="Website">
                <MdLanguage />
              </IconButton>
            </Tooltip>
          )}
          {member.linkedin && (
            <Tooltip title="LinkedIn">
              <IconButton href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </IconButton>
            </Tooltip>
          )}
          {member.twitter && (
            <Tooltip title="Twitter">
              <IconButton href={member.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </IconButton>
            </Tooltip>
          )}
          {member.github && (
            <Tooltip title="GitHub">
              <IconButton href={member.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </IconButton>
            </Tooltip>
          )}
          {member.googlescholar && (
            <Tooltip title="Google Scholar">
              <IconButton href={member.googlescholar} target="_blank" rel="noopener noreferrer" aria-label="Google Scholar">
                <FaSchool />
              </IconButton>
            </Tooltip>
          )}
          {member.researchGate && (
            <Tooltip title="ResearchGate">
              <IconButton href={member.researchGate} target="_blank" rel="noopener noreferrer" aria-label="ResearchGate">
                <AiOutlineProject />
              </IconButton>
            </Tooltip>
          )}
          {member.orcid && (
            <Tooltip title="ORCID">
              <IconButton href={`https://orcid.org/${member.orcid}`} target="_blank" rel="noopener noreferrer" aria-label="ORCID">
                <img src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" alt="ORCID" style={{ width: 20, height: 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </SocialIcons>
      </StyledCardContent>
    </StyledCard>
  );
}
