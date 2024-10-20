import { useState } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from '../../../routes/hooks/useRouter';

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
    href: '/',
  },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
    href: '/me',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
    href: '/settings',
  },
];


export default function AccountPopover() {
  const [open, setOpen] = useState<any>(null);

  const router = useRouter();
  const { authUser, logout } = useAuth();

  const handleOpen = (event: any) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (href: string) => {
    router.push(href)
    setOpen(null);
  };

  const handleLogoutClose = () => {
    logout();
    setOpen(null);
  }

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={authUser.user?.profilePicture || 'assets/images/broken-avatar.svg'}
          alt={authUser.user?.firstName + " " + authUser.user?.lastName}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {(authUser.user?.firstName.charAt(0).toUpperCase() || '') + ' ' + (authUser.user?.lastName.charAt(0).toUpperCase() || '')}
        </Avatar>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={()=>setOpen(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 0,
              mt: 1,
              ml: 0.75,
              width: 200,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {authUser.user?.firstName} {authUser.user?.lastName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            @{authUser.user?.username}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {MENU_OPTIONS.map((option) => (
          <MenuItem key={option.label} onClick={() => handleClose(option.href)}>
            {option.label}
          </MenuItem>
        ))}

        <Divider sx={{ borderStyle: 'dashed', m: 0 }} />

        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={handleLogoutClose}
          sx={{ typography: 'body2', color: 'error.main', py: 1.5 }}
        >
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
