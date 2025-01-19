import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { primary } from '../../../core/theme/palette';
import { validateRegister } from '../../utils/validators/register-validators';
import { registerUser } from '../../api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../../core/hooks/useRouter';

export type RegisterFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone: string;
  address?: string;
};

const RegisterForm: React.FC = () => {
  const [errors, setErrors] = useState<string[]>([]);

  const { login } = useAuth();
  const router = useRouter();

  function handleRegister(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const formValues: RegisterFormProps = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };

    const errors = validateRegister(formValues);

    if (errors.length > 0) {
      setErrors(errors);
    } else {
      registerUser(formValues, setErrors).then(response => {
        
        const loggedUser = {
          id: response.id,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          avatar: response.avatar,
        };
        
        login(loggedUser, response.token, response.tokenExpiration);
        router.push('/');
      });
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleRegister}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '95dvw',
        maxWidth: 550,
        backgroundColor: '#fff',
        padding: 3,
        borderRadius: 2.5,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontSize: '40px',
          color: 'royalblue',
          fontWeight: 600,
          letterSpacing: '-1px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          pl: '30px',
          '&::before': {
            content: '""',
            position: 'absolute',
            height: '18px',
            width: '18px',
            borderRadius: '50%',
            left: 0,
            backgroundColor: 'royalblue',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            height: '18px',
            width: '18px',
            borderRadius: '50%',
            left: 0,
            backgroundColor: 'royalblue',
            animation: 'pulse 1s linear infinite',
          },
        }}
      >
        Register
      </Typography>

      {errors.length > 0 ? (
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
      ) : (
        <Typography
          sx={{
            fontSize: '16px',
            color: 'rgba(88, 87, 87, 0.822)',
          }}
        >
          Signup now and get full access SPHERE 🥳
        </Typography>
      )}

      {/* Name Fields */}
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <TextField
            required
            label="Firstname"
            variant="outlined"
            name="firstName"
            fullWidth
            slotProps={{
              input: {
                sx: {
                  borderRadius: 1.25,
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required
            label="Lastname"
            variant="outlined"
            name="lastName"
            fullWidth
            slotProps={{
              input: {
                sx: {
                  borderRadius: 1.25,
                },
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Email Field */}
      <TextField
        required
        label="Email"
        type="email"
        variant="outlined"
        name="email"
        fullWidth
        slotProps={{
          input: {
            sx: {
              borderRadius: 1.25,
            },
          },
        }}
      />

      {/* Password Fields */}
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <TextField
            required
            label="Password"
            type="password"
            name="password"
            variant="outlined"
            fullWidth
            slotProps={{
              input: {
                sx: {
                  borderRadius: 1.25,
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required
            label="Confirm Password"
            type="password"
            variant="outlined"
            name="confirmPassword"
            fullWidth
            slotProps={{
              input: {
                sx: {
                  borderRadius: 1.25,
                },
              },
            }}
          />
        </Grid>
      </Grid>

      <TextField
        required
        label="Phone (+1234567890)"
        type="text"
        variant="outlined"
        name="phone"
        fullWidth
        slotProps={{
          input: {
            sx: {
              borderRadius: 1.25,
            },
          },
        }}
      />

      <TextField
        label="Address"
        type="text"
        variant="outlined"
        name="address"
        fullWidth
        slotProps={{
          input: {
            sx: {
              borderRadius: 1.25,
            },
          },
        }}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: 'royalblue',
          color: '#fff',
          borderRadius: 1.25,
          padding: '10px',
          fontSize: '16px',
          '&:hover': {
            backgroundColor: primary[800],
          },
        }}
      >
        Submit
      </Button>

      {/* Signin Link */}
      <Typography
        sx={{
          fontSize: '18px',
          color: 'rgba(88, 87, 87, 0.822)',
          textAlign: 'center',
        }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          style={{
            color: primary[700],
          }}
        >
          Sign In
        </Link>
      </Typography>
    </Box>
  );
};

export default RegisterForm;
