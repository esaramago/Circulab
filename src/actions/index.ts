import { signIn } from './auth/signIn'
import { checkUser } from './auth/checkUser'
import { logout } from './auth/logout'
import { resetPassword } from './auth/resetPassword'
import { updatePassword } from './auth/updatePassword'
import { getSession } from './auth/getSession'
import { getPins, addResource, getResources, getResource, getFullResources, deleteResource, editResource, getNetworks } from './resources'
import { addCategory, updateCategory, deleteCategory, getCategories, getCategoryById } from './categories'
import { updateTypology, getTypologies, getTypologyById } from './typologies'
import { submitContact } from './contact'

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
  getFullResources,
  deleteResource,
  editResource,
  getNetworks,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateTypology,
  getTypologies,
  getTypologyById,
  submitContact,
}

