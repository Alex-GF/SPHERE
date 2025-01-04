import request from 'supertest'
import { adminCredentials, userCredentials, generateFakeUser } from './testData'
import { getApp } from './testApp'
import { User } from '../../src/types/database/User';

let loggedInUser: User, loggedInAdmin: User;

const getNewloggedInAdmin = async () => {
  const fakeOwner = await generateFakeUser()
  await request(await getApp()).post('/users/registerOwner').send(fakeOwner)
  return (await request(await getApp()).post('/users/loginOwner').send({ email: fakeOwner.email, password: fakeOwner.password })).body
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
  const fakeCustomer = await generateFakeUser(name)
  await request(await getApp()).post('/users/register').send(fakeCustomer)
  const getloggedInUser = (await request(await getApp()).post('/users/login').send({ email: fakeCustomer.email, password: fakeCustomer.password })).body
  return getloggedInUser
}

export { getLoggedInAdmin, getNewloggedInAdmin, getLoggedInUser, getNewloggedInUser }
