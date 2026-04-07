import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateRegister } from '../../utils/validators/register-validators';
import { registerUser } from '../../api/usersApi';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../../core/hooks/useRouter';

export type RegisterFormProps = {
  firstName: string;
  lastName: string;
  username: string;
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
      username: formData.get('username') as string,
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
          username: response.username,
          email: response.email,
          avatar: response.avatar,
        };
        
        login(loggedUser, response.token, response.tokenExpiration);
        router.push('/');
      });
    }
  }

  return (
    <form
      onSubmit={handleRegister}
      className="relative flex w-[95dvw] max-w-[550px] flex-col gap-2 rounded-[20px] bg-white p-3 shadow-[0px_4px_10px_rgba(0,0,0,0.1)]"
    >
      {/* Title */}
      <h1 className="relative flex items-center pl-[30px] text-[40px] font-semibold tracking-[-1px] text-[royalblue]">
        <span className="absolute left-0 h-[18px] w-[18px] rounded-full bg-[royalblue]" />
        <span className="absolute left-0 h-[18px] w-[18px] rounded-full bg-[royalblue] animate-register-pulse" />
        Register
      </h1>

      {errors.length > 0 ? (
        <div className="mb-2 w-full rounded-[20px] bg-[rgba(255,0,0,0.8)] p-2 text-center text-white">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      ) : (
        <p className="text-base text-[rgba(88,87,87,0.822)]">
          Signup now and get full access SPHERE 🥳
        </p>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input required placeholder="Firstname" type="text" name="firstName" className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700" />
        <input required placeholder="Lastname" type="text" name="lastName" className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700" />
      </div>

      {/* Username Field */}
      <input
        required
        placeholder="Username"
        type="text"
        name="username"
        className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700"
      />

      {/* Email Field */}
      <input
        required
        placeholder="Email"
        type="email"
        name="email"
        className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700"
      />

      {/* Password Fields */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input required placeholder="Password" type="password" name="password" className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700" />
        <input required placeholder="Confirm Password" type="password" name="confirmPassword" className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700" />
      </div>

      <input
        required
        placeholder="Phone (+1234567890)"
        type="text"
        name="phone"
        className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700"
      />

      <input
        placeholder="Address"
        type="text"
        name="address"
        className="w-full rounded-[10px] border border-sphere-grey-300 px-3 py-2 outline-none focus:border-sphere-primary-700"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="rounded-[10px] bg-[royalblue] px-[10px] py-[10px] text-base text-white transition-colors hover:bg-[#023e8a]"
      >
        Submit
      </button>

      {/* Signin Link */}
      <p className="text-center text-[18px] text-[rgba(88,87,87,0.822)]">
        Already have an account?{' '}
        <Link to="/login" className="text-sphere-primary-700">
          Sign In
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
