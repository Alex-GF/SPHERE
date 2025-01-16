import dotenv from 'dotenv';
import request from 'supertest';
import { getApp, shutdownApp } from './utils/testApp';
import { Server } from 'http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateFakeUser } from './utils/testData';
import { getLoggedInAdmin, getLoggedInUser, getNewloggedInUser } from './utils/auth';

dotenv.config();

describe('Get public user information', function () {
  let app: Server;

  beforeAll(async function () {
    app = await getApp();
  });

  describe('POST /users/register', function () {
    it('Should return 201 and the user created', async function () {
      const newUser = generateFakeUser('user');
      const response = await request(app).post('/api/users/register').send(newUser);
      expect(response.status).toEqual(201);
      expect(response.body.password).toBeUndefined();
      expect(response.body.email).toEqual(newUser.email);
      expect(response.body.userType).toEqual('user');
      expect(response.body.avatar).toBeUndefined();
    });

    it('Should return 201 and the user created when giving a 3 letter firstname', async function () {
      const newUser = generateFakeUser('user');
      newUser.firstName = 'abc';
      const response = await request(app).post('/api/users/register').send(newUser);
      expect(response.status).toEqual(201);
      expect(response.body.password).toBeUndefined();
      expect(response.body.userType).toEqual('user');
      expect(response.body.firstName).toEqual(newUser.firstName);
    });

    it('Should return 201 and the user created when giving a 255 letter firstname', async function () {
      const newUser = generateFakeUser('user');
      newUser.firstName = 'a'.repeat(255);
      const response = await request(app).post('/api/users/register').send(newUser);
      expect(response.status).toEqual(201);
      expect(response.body.password).toBeUndefined();
      expect(response.body.userType).toEqual('user');
      expect(response.body.firstName).toEqual(newUser.firstName);
    });

    it('Should return 201 and the user created when giving a 3 letter lastname', async function () {
      const newUser = generateFakeUser('user');
      newUser.lastName = 'abc';
      const response = await request(app).post('/api/users/register').send(newUser);
      expect(response.status).toEqual(201);
      expect(response.body.password).toBeUndefined();
      expect(response.body.userType).toEqual('user');
      expect(response.body.lastName).toEqual(newUser.lastName);
    });

    it('Should return 201 and the user created when giving a 255 letter lastname', async function () {
      const newUser = generateFakeUser('user');
      newUser.lastName = 'a'.repeat(255);
      const response = await request(app).post('/api/users/register').send(newUser);
      expect(response.status).toEqual(201);
      expect(response.body.password).toBeUndefined();
      expect(response.body.userType).toEqual('user');
      expect(response.body.lastName).toEqual(newUser.lastName);
    });

    describe('firstName field validation', function () {
      it('Should return 422 if firstName is missing', async function () {
        const newUser: any = generateFakeUser('user');
        delete newUser.firstName;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'A first name must be provided in order to create the user'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if firstName is not a string', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.firstName = 123;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The firstName field must be a string'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if firstName length is invalid', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.firstName = 'ab';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The first name must have between 3 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('lastName field validation', function () {
      it('Should return 422 if lastName is missing', async function () {
        const newUser: any = generateFakeUser('user');
        delete newUser.lastName;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'A last name must be provided in order to create the user'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if lastName is not a string', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.lastName = 123;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The lastName field must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if lastName length is invalid', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.lastName = '';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The last name must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('email field validation', function () {
      it('Should return 422 if email is missing', async function () {
        const newUser: any = generateFakeUser('user');
        delete newUser.email;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'An email must be provided in order to create the user'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if email is not a string', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.email = 123;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The email field must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if email is invalid', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.email = 'invalidEmail';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'Invalid email format. Please, provide a valid email'
          )
        ).toBeTruthy();
      });
    });

    describe('password field validation', function () {
      it('Should return 422 if password is missing', async function () {
        const newUser: any = generateFakeUser('user');
        delete newUser.password;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'A password must be specified in order to create the user'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if password is not a string', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.password = 1234;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The field password must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if password is too short', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.password = '12';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The password must have at least 3 characters'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if password contains spaces', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.password = '1234 5678';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'No spaces are allowed in the password'
          )
        ).toBeTruthy();
      });
    });

    describe('phone field validation', function () {
      it('Should return 422 if phone is missing', async function () {
        const newUser: any = generateFakeUser('user');
        delete newUser.phone;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'A phone must be specified in order to create the user'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if phone is not a string', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.phone = 123456789;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The field phone must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if phone length is invalid', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.phone = '';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The phone must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('address field validation', function () {
      it('Should return 422 if address is missing', async function () {
        const newUser: any = generateFakeUser('user');
        delete newUser.address;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'A address must be specified in order to create the user'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if address is not a string', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.address = 123;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The field address must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if address length is invalid', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.address = '';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The address must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('postalCode field validation', function () {
      it('Should return 422 if postalCode is missing', async function () {
        const newUser: any = generateFakeUser('user');
        delete newUser.postalCode;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'A postalCode must be specified in order to create the user'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if postalCode is not a string', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.postalCode = 12345;
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The field postalCode must be a string'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if postalCode length is invalid', async function () {
        const newUser: any = generateFakeUser('user');
        newUser.postalCode = '';
        const response = await request(app).post('/api/users/register').send(newUser);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The postalCode must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });
  });

  describe('POST /users/registerAdmin', function () {
    it('Should return 201 and the admin created', async function () {
      const newAdmin = generateFakeUser('admin');
      const loggedAdminToken = await getLoggedInAdmin();
      const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
      expect(response.status).toEqual(201);
      expect(response.body.password).toBeUndefined();
      expect(response.body.email).toEqual(newAdmin.email);
      expect(response.body.userType).toEqual("admin");
      expect(response.body.avatar).toBeUndefined();
    });

    it("Should return 403 when a normal user tries to create an admin", async function () { 
      const newAdmin = generateFakeUser('admin');
      const loggedUserToken = await getLoggedInUser();
      const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedUserToken.token}`).send(newAdmin);
      expect(response.status).toEqual(403);
    })

    it("Should return 401 when trying to create an admin without authenticating as one", async function () { 
      const newAdmin = generateFakeUser('admin');
      const response = await request(app).post('/api/users/registerAdmin').send(newAdmin);
      expect(response.status).toEqual(401);
    })

    
      describe('firstName field validation', function () {
        it('Should return 422 if firstName is missing', async function () {
          const newAdmin: any = generateFakeUser('admin');
          delete newAdmin.firstName;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'A first name must be provided in order to create the user')).toBeTruthy();
        });

        it('Should return 422 if firstName is not a string', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.firstName = 123;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The firstName field must be a string')).toBeTruthy();
        });

        it('Should return 422 if firstName length is invalid', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.firstName = 'ab';
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The first name must have between 3 and 255 characters long')).toBeTruthy();
        });
      });

      describe('lastName field validation', function () {
        it('Should return 422 if lastName is missing', async function () {
          const newAdmin: any = generateFakeUser('admin');
          delete newAdmin.lastName;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'A last name must be provided in order to create the user')).toBeTruthy();
        });

        it('Should return 422 if lastName is not a string', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.lastName = 123;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The lastName field must be a string')).toBeTruthy();
        });
      });

      describe('email field validation', function () {
        it('Should return 422 if email is missing', async function () {
          const newAdmin: any = generateFakeUser('admin');
          delete newAdmin.email;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'An email must be provided in order to create the user')).toBeTruthy();
        });

        it('Should return 422 if email is not a string', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.email = 123;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The email field must be a string')).toBeTruthy();
        });

        it('Should return 422 if email is invalid', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.email = 'invalidEmail';
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'Invalid email format. Please, provide a valid email')).toBeTruthy();
        });
      });

      describe('password field validation', function () {
        it('Should return 422 if password is missing', async function () {
          const newAdmin: any = generateFakeUser('admin');
          delete newAdmin.password;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'A password must be specified in order to create the user')).toBeTruthy();
        });

        it('Should return 422 if password is not a string', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.password = 1234;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The field password must be a string')).toBeTruthy();
        });

        it('Should return 422 if password is too short', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.password = '12';
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The password must have at least 3 characters')).toBeTruthy();
        });

        it('Should return 422 if password contains spaces', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.password = '1234 5678';
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'No spaces are allowed in the password')).toBeTruthy();
        });
      });

      describe('phone field validation', function () {
        it('Should return 422 if phone is missing', async function () {
          const newAdmin: any = generateFakeUser('admin');
          delete newAdmin.phone;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'A phone must be specified in order to create the user')).toBeTruthy();
        });

        it('Should return 422 if phone is not a string', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.phone = 123456789;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The field phone must be a string')).toBeTruthy();
        });

        it('Should return 422 if phone length is invalid', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.phone = '';
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The phone must have between 1 and 255 characters long')).toBeTruthy();
        });
      });

      describe('address field validation', function () {
        it('Should return 422 if address is missing', async function () {
          const newAdmin: any = generateFakeUser('admin');
          delete newAdmin.address;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'A address must be specified in order to create the user')).toBeTruthy();
        });

        it('Should return 422 if address is not a string', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.address = 123;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The field address must be a string')).toBeTruthy();
        });

        it('Should return 422 if address length is invalid', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.address = '';
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The address must have between 1 and 255 characters long')).toBeTruthy();
        });
      });

      describe('postalCode field validation', function () {
        it('Should return 422 if postalCode is missing', async function () {
          const newAdmin: any = generateFakeUser('admin');
          delete newAdmin.postalCode;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'A postalCode must be specified in order to create the user')).toBeTruthy();
        });

        it('Should return 422 if postalCode is not a string', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.postalCode = 12345;
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The field postalCode must be a string')).toBeTruthy();
        });

        it('Should return 422 if postalCode length is invalid', async function () {
          const newAdmin: any = generateFakeUser('admin');
          newAdmin.postalCode = '';
          const loggedAdminToken = await getLoggedInAdmin();
          const response = await request(app).post('/api/users/registerAdmin').set("Authorization", `Bearer ${loggedAdminToken.token}`).send(newAdmin);
          expect(response.status).toEqual(422);
          expect(response.body.errors.some((err: any) => err.msg === 'The postalCode must have between 1 and 255 characters long')).toBeTruthy();
        });
      });
  });

  describe('PUT /users', function () {

    it('Should return 401 when fake auth token is provided', async function () {
      const fakeToken = 'fakeToken';
      const requestBody: any = { firstName: 'New Name' };
      const response = await request(app)
        .put('/api/users')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send(requestBody);
      expect(response.status).toEqual(401);
      expect(response.body.error).toBe('Token not valid');
    });

    it('Should return 401 and ask for authentication', async function () {
      const requestBody: any = { firstName: 'New Name' };
      const response = await request(app)
        .put('/api/users')
        .send(requestBody);
      expect(response.status).toEqual(401);
      expect(response.body.error).toBe('No authorization header found');
    });

    describe('firstName field validation', function () {
      it('Should return 200 and the updated user', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { firstName: 'New Name' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(200);
        expect(response.body.password).toBeUndefined();
        expect(response.body.firstName).toEqual(requestBody.firstName);
      });

      it('Should return 422 if firstName is not a string', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { firstName: 123 };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The firstName field must be a string'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if firstName length is invalid', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { firstName: 'ab' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The first name must have between 3 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('lastName field validation', function () {
      it('Should return 200 and the updated user', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { lastName: 'New Last Name' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(200);
        expect(response.body.password).toBeUndefined();
        expect(response.body.lastName).toEqual(requestBody.lastName);
      });

      it('Should return 422 if lastName is not a string', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { lastName: 123 };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The lastName field must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if lastName length is invalid', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { lastName: '' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The last name must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('email field validation', function () {
      it('Should return 200 and the updated user', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { email: 'newemail@example.com' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(200);
        expect(response.body.password).toBeUndefined();
        expect(response.body.email).toEqual(requestBody.email);
      });

      it('Should return 422 if email is not a string', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { email: 123 };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The email field must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if email is invalid', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { email: 'invalidEmail' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'Invalid email format. Please, provide a valid email'
          )
        ).toBeTruthy();
      });
    });

    describe('phone field validation', function () {
      it('Should return 200 and the updated user', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { phone: '1234567890' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(200);
        expect(response.body.password).toBeUndefined();
        expect(response.body.phone).toEqual(requestBody.phone);
      });

      it('Should return 422 if phone is not a string', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { phone: 1234567890 };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The field phone must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if phone length is invalid', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { phone: '' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The phone must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('address field validation', function () {
      it('Should return 200 and the updated user', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { address: 'New Address' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(200);
        expect(response.body.password).toBeUndefined();
        expect(response.body.address).toEqual(requestBody.address);
      });

      it('Should return 422 if address is not a string', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { address: 123 };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some((err: any) => err.msg === 'The field address must be a string')
        ).toBeTruthy();
      });

      it('Should return 422 if address length is invalid', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { address: '' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The address must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });

    describe('postalCode field validation', function () {
      it('Should return 200 and the updated user', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { postalCode: '12345' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(200);
        expect(response.body.password).toBeUndefined();
        expect(response.body.postalCode).toEqual(requestBody.postalCode);
      });

      it('Should return 422 if postalCode is not a string', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { postalCode: 12345 };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The field postalCode must be a string'
          )
        ).toBeTruthy();
      });

      it('Should return 422 if postalCode length is invalid', async function () {
        const loggedUserToken: any = await getLoggedInUser();
        const requestBody: any = { postalCode: '' };
        const response = await request(app)
          .put('/api/users')
          .set('Authorization', `Bearer ${loggedUserToken.token}`)
          .send(requestBody);
        expect(response.status).toEqual(422);
        expect(
          response.body.errors.some(
            (err: any) => err.msg === 'The postalCode must have between 1 and 255 characters long'
          )
        ).toBeTruthy();
      });
    });
  });

  describe('DELETE /users', function () {
    it('Should return 200', async function () {
      const newUserToken: any = await getNewloggedInUser("testUser");
      const response = await request(app)
        .delete('/api/users')
        .set('Authorization', `Bearer ${newUserToken.token}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual('Successfully deleted.');
    });

    it('Should return 401', async function () {
      const fakeToken = "test"
      const response = await request(app)
        .delete('/api/users')
        .set('Authorization', `Bearer ${fakeToken}`);
      expect(response.status).toEqual(401);
      expect(response.body.error).toEqual('Token not valid');
    });
  })

  afterAll(async function () {
    await shutdownApp();
  });
});
