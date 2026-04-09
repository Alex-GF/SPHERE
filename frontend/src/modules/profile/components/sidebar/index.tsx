import ProfileAvatar from '../profile-avatar';
import { useAuth } from '../../../auth/hooks/useAuth';

export default function ProfileSidebar({sidebarWidth}: {sidebarWidth: number}) {
  const {authUser} = useAuth();

  const avatarSizeClass = sidebarWidth >= 400 ? 'h-[400px] w-[400px]' : 'h-[300px] w-[300px]';

  return (
    <div className="p-2">
      {/* Avatar */}
      <div className="flex justify-center">
        <ProfileAvatar sizeClass={avatarSizeClass} />
      </div>

      {/* Name and Username */}
      <div className="mt-2 text-center">
        <h2 className="text-xl font-semibold">{authUser.user?.firstName} {authUser.user?.lastName}</h2>
        <p className="text-base text-sphere-grey-600">
          {authUser.user?.username}
        </p>
      </div>

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

      <div className="my-2 border-b border-slate-300" />

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
    </div>
  );
}
