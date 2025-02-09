import { faker } from '@faker-js/faker';

const adminCredentials = {
  loginField: 'admin1@admin.com',
  password: process.env.ADMIN_PASSWORD,
};

const noEmailAdminCredentials = {
  password: process.env.ADMIN_PASSWORD,
};

const userCredentials = {
  loginField: 'test_user@test.com',
  password: process.env.USER_PASSWORD,
};

const noEmailUserCredentials = {
  password: process.env.USER_PASSWORD,
};

const invalidCredentials = {
  loginField: 'invalidCredential@customer.com',
  password: 'invalid',
};
const generateFakeUser = (type: "user" | "admin", name?: string) => {
  const firstName = name || faker.person.firstName();
  const lastName = faker.person.lastName();
  let username = faker.internet.username({ firstName: firstName.toLowerCase(), lastName: lastName.toLowerCase() }).slice(0, 15);
  if (username.length < 3) {
    username = username.padEnd(3, '0');
  }
  const email = faker.internet.email({ firstName: firstName.toLowerCase(), lastName: lastName.toLowerCase() });
  const password = '12345678AaBb_!';
  const phone = faker.phone.number();
  const avatar = faker.image.avatar() + `?timestamp=${Math.floor(Math.random() * 100)}`;
  const address = `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}.`;
  const postalCode = faker.location.zipCode();
  const userType = type;

  return {
    firstName,
    lastName,
    username,
    email,
    password,
    phone,
    avatar,
    address,
    postalCode,
    userType,
  };
};

export {
  adminCredentials,
  userCredentials,
  noEmailUserCredentials,
  noEmailAdminCredentials,
  invalidCredentials,
  generateFakeUser,
};
