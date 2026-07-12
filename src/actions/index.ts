import { signIn } from './auth/signIn'
import { checkUser } from './auth/checkUser'
import { logout } from './auth/logout'
import { resetPassword } from './auth/resetPassword'
import { updatePassword } from './auth/updatePassword'
import { getSession } from './auth/getSession'
import { getPins, addResource, getResources, getResource } from './resources'

export const server = {
  signIn,
  resetPassword,
  updatePassword,
  logout,
  checkUser,
  getSession,
  getPins,
  addResource,
  getResources,
  getResource,
}
