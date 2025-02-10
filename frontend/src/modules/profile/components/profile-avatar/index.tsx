import { Box } from '@mui/material';
import { useAuth } from '../../../auth/hooks/useAuth';

interface ProfileAvatarProps {
  size?: number;
}

export default function ProfileAvatar({ size }: ProfileAvatarProps) {
  
  const {authUser} = useAuth();
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
      }}
    >
      <img
        src={authUser.user?.avatar}
        alt="Avatar"
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      />
    </Box>
  );
}
