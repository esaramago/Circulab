import { signIn } from './auth/signIn'
import { checkUser } from './auth/checkUser'
import { logout } from './auth/logout'
import { resetPassword } from './auth/resetPassword'
import { updatePassword } from './auth/updatePassword'
import { getPins, addResource, getResources, getResource } from './resources'

export const server = {
  signIn,
  resetPassword,
  updatePassword,
  logout,
  checkUser,
  getPins,
  addResource,
  getResources,
  getResource,
}
