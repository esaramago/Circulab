import { signIn } from './auth/signIn'
import { checkUser } from './auth/checkUser'
import { logout } from './auth/logout'
import { getUser } from './getUser'
import { getMarkers } from './markers'

export const server = {
  signIn,
  logout,
  getUser,
  checkUser,
  getMarkers,
}