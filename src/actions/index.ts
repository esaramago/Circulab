import { signIn } from './auth/signIn'
import { checkUser } from './auth/checkUser'
import { logout } from './auth/logout'
import { resetPassword } from './auth/resetPassword'
import { updatePassword } from './auth/updatePassword'
import { getUser } from './getUser'
import { getMapPins, addMarker, getMarkers } from './markers'

export const server = {
  signIn,
  resetPassword,
  updatePassword,
  logout,
  getUser,
  checkUser,
  getMapPins,
  addMarker,
  getMarkers,
}
