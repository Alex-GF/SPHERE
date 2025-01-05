import { faker } from '@faker-js/faker';

const adminCredentials = {
  email: 'admin1@admin.com',
  password: 'secret',
};

const noEmailAdminCredentials = {
  password: 'secret',
};

const userCredentials = {
  email: 'user1@user.com',
  password: 'secret',
};

const noEmailUserCredentials = {
  password: 'secret',
};

const invalidCredentials = {
  email: 'invalidCredential@customer.com',
  password: 'secret',
};
const generateFakeUser = (type: "user" | "admin", name?: string) => {
  const firstName = name || faker.person.firstName();
  const lastName = faker.person.lastName();
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
