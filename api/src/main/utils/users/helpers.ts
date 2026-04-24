import crypto from 'crypto';
import bcrypt from 'bcryptjs';

function generateUserTokenDTO() {
  return {
        token: crypto.randomBytes(20).toString('hex'),
        tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };
};

// function generateOrganizationApiKey() {
//   const apiKey = "org_" + crypto.randomBytes(32).toString('hex');
//   return apiKey;
// };

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(5);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

function handleError(err: any): {status: number, message: string} {
  if (err.message.toLowerCase().includes('permission error')) {
    return { status: 403, message: err.message };
  } else if (err.message.toLowerCase().includes('invalid data')) {
    return { status: 422, message: err.message };
  } else {
    return { status: 500, message: err.message };
  }
}

export { generateUserTokenDTO, handleError, hashPassword };