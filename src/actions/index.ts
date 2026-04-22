import { signIn } from './auth/signIn'
import { checkUser } from './auth/checkUser'
import { getUser } from './getUser'

export const server = {
  signIn,
  getUser,
  checkUser,
}