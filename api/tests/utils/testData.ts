import { faker } from '@faker-js/faker';

const adminCredentials = {
  email: 'testAdmin@admin.com',
  password: 'testUser',
};

const noEmailAdminCredentials = {
  password: 'secret',
};

const userCredentials = {
  email: 'testUser@user.com',
  password: 'testUser',
};

const noEmailUserCredentials = {
  password: 'secret',
};

const invalidCredentials = {
  email: 'invalidCredential@customer.com',
  password: 'secret',
};
const generateFakeUser = async (name?: string) => {
  const firstName = name || faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName: firstName, lastName: lastName });
  const password = '12345678AaBb_!';
  const phone = faker.phone.number();
  const avatar = faker.image.avatar() + `?timestamp=${Math.floor(Math.random() * 100)}`;
  const address = `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}.`;
  const postalCode = faker.location.zipCode();
  const userType = faker.helpers.arrayElement(['user', 'admin']);
  const createdAt = new Date();
  const updatedAt = createdAt;

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
    createdAt,
    updatedAt,
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
