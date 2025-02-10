import { Box, Button, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ProfileAvatar from '../profile-avatar';
import { useAuth } from '../../../auth/hooks/useAuth';

export default function ProfileSidebar({sidebarWidth}: {sidebarWidth: number}) {
  const {authUser} = useAuth();

  return (
    <Box sx={{ p: 2 }}>
      {/* Avatar */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ProfileAvatar size={sidebarWidth} />
      </Box>

      {/* Name and Username */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="h6">{authUser.user?.firstName} {authUser.user?.lastName}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {authUser.user?.username}
        </Typography>
      </Box>

      {/* Action Buttons */}
      {/* <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button variant="outlined" size="small">
          Edit profile
        </Button>
        <Button variant="outlined" size="small">
          Settings
        </Button>
      </Box> */}

      {/* URL */}
      {/* <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link to="https://alejandro-garcia-fernandez..." target="_blank" rel="noopener noreferrer">
          https://alejandro-garcia-fernandez.vercel.app/
        </Link>
      </Box> */}

      <Divider sx={{ my: 2 }} />

      {/* Interest Sections */}
      {/* <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          AI & ML interests
        </Typography>
        <Typography>No tiene intereses configurados todavía.</Typography>
      </Box> */}

      {/* Organizations Section */}
      {/* <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Organizations
        </Typography>
        <Typography>Ninguna todavía</Typography>
      </Box> */}
    </Box>
  );
}
