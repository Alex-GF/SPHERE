// LoginForm.tsx
import React from 'react';
import { Box, Typography, TextField, Button, Link} from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { validateLogin } from '../../utils/validators/login-validators';
import { loginUser } from '../../api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../../core/hooks/useRouter';

export type LoginFormProps = {
  loginField: string;
  password: string;
}

const LoginForm: React.FC = () => {
  
  const [errors, setErrors] = React.useState<string[]>([]);

  const {login} = useAuth();
  const router = useRouter();

  function handleLogin(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const formValues: LoginFormProps = {
      loginField: formData.get('loginField') as string,
      password: formData.get('password') as string,
    }

    const errors = validateLogin(formValues);
    
    if (errors.length > 0) {
      setErrors(errors);
    }else{
      loginUser(formValues)
        .then((response: any) => {

          if (response.error) {
            setErrors([response.error]);
            return;
          }

          const loggedUser = {
            id: response.id,
            firstName: response.firstName,
            lastName: response.lastName,
            username: response.username,
            email: response.email,
            avatar: response.avatar,
          }

          login(loggedUser, response.token, response.tokenExpiration);

          router.push('/');
        })
    }
  }
  
  return (
    <Box
      sx={{
        width: '95dvw',
        maxWidth: 450,
        height: '95dvh',
        maxHeight: 600,
        backgroundColor: '#fff',
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
        borderRadius: 2,
        boxSizing: 'border-box',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontSize: '30px',
          textAlign: 'center',
          fontWeight: 800,
          mb: 4,
        }}
      >
        Welcome back!
      </Typography>
      
      {errors.length > 0 && (
        <Box
          sx={{
            width: '100%',
            borderRadius: '20px',
            backgroundColor: 'rgba(255,0,0,0.8)',
            color: 'white',
            p: 2,
            mb: 2,
            textAlign: 'center',
          }}
        >
          {errors.map((error, index) => (
            <Typography key={index}>{error}</Typography>
          ))}
        </Box>
      )}

      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Username or Email"
          name="loginField"
          sx={{
            borderRadius: '20px',
          }}
          slotProps={{
            input: {
              sx: { borderRadius: '20px' },
            },
          }}
        />
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Password"
          type="password"
          name="password"
          slotProps={{
            input: {
              sx: { borderRadius: '20px' },
            },
          }}
        />
        {/* <Link
          href="#"
          underline="hover"
          sx={{
            fontSize: "9px",
            fontWeight: 700,
            textAlign: "end",
            color: "#747474",
            cursor: "pointer",
            "&:hover": {
              color: "#000",
            },
          }}
        >
          Forgot Password?
        </Link> */}
        <Button
          variant="contained"
          fullWidth
          type="submit"
          sx={{
            backgroundColor: 'teal',
            color: 'white',
            borderRadius: '20px',
            p: 1,
            '&:hover': { backgroundColor: 'darkslategray' },
            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
          }}
        >
          Log in
        </Button>
      </Box>

      <Typography
        sx={{
          fontSize: '14px',
          color: '#747474',
          mb: 2,
          textAlign: 'center',
        }}
      >
        Don't have an account?{' '}
        <Link
          href="/register"
          sx={{
            fontSize: '14px',
            textDecoration: 'underline',
            color: 'teal',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Sign up
        </Link>
      </Typography>

      {/* <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%',
        }}
      >
        <Button
          fullWidth
          startIcon={<AppleIcon />}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '20px',
            p: 1,
            fontWeight: 500,
            '&:hover': { backgroundColor: '#333' },
            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
          }}
        >
          Log in with Apple
        </Button>
        <Button
          fullWidth
          startIcon={<GoogleIcon />}
          sx={{
            border: '2px solid #747474',
            color: '#747474',
            borderRadius: '20px',
            p: 1,
            fontWeight: 500,
            '&:hover': { borderColor: '#555', color: '#555' },
          }}
        >
          Log in with Google
        </Button>
      </Box> */}
    </Box>
  );
};

export default LoginForm;
