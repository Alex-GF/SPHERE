import request from 'supertest'
import { adminCredentials, userCredentials, generateFakeUser } from './testData'
import { getApp } from './testApp'
import { User } from '../../src/types/database/User';

let loggedInUser: User, loggedInAdmin: User;

const getNewloggedInAdmin = async () => {
  const fakeAdmin = await generateFakeUser("admin")
  const loggedAdmin = await getLoggedInAdmin();
  await request(await getApp()).post('/users/registerAdmin').set('Authorization', `Bearer ${loggedAdmin.token}`).send(fakeAdmin)
  return (await request(await getApp()).post('/users/loginAdmin').send({ email: fakeAdmin.email, password: fakeAdmin.password })).body
}

const getLoggedInAdmin = async () => {
  if (loggedInAdmin) return loggedInAdmin
  const response = await request(await getApp()).post('/users/loginAdmin').send(adminCredentials)
  loggedInAdmin = response.body
  return loggedInAdmin
}

const getLoggedInUser = async () => {
  if (loggedInUser) return loggedInUser
  const response = await request(await getApp()).post('/users/login').send(userCredentials)
  loggedInUser = response.body
  return loggedInUser
}

const getNewloggedInUser = async (name: string) => {
  const fakeUser = await generateFakeUser("user", name)
  await request(await getApp()).post('/users/register').send(fakeUser)
  const getloggedInUser = (await request(await getApp()).post('/users/login').send({ email: fakeUser.email, password: fakeUser.password })).body
  return getloggedInUser
}

export { getLoggedInAdmin, getNewloggedInAdmin, getLoggedInUser, getNewloggedInUser }
