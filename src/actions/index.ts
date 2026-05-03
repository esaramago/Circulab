import { signIn } from './auth/signIn'
import { checkUser } from './auth/checkUser'
import { getUser } from './getUser'
import { getMarkers } from './markers'

export const server = {
  signIn,
  getUser,
  checkUser,
  getMarkers,
}