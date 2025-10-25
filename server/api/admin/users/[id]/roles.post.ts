import { defineEventHandler, createError } from 'h3'
import { changeUserRoles as appwriteChangeUserRoles } from '../../../../utils/appwrite-admin'
import isAdmin from '../../../../middleware/isAdmin'

export async function changeRolesHandler(userId: string, roles: string[]) {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }
  if (!Array.isArray(roles)) {
    throw createError({ statusCode: 400, statusMessage: 'Roles must be an array' })
  }

  await appwriteChangeUserRoles(userId, roles)
  return { success: true }
}

export default defineEventHandler(async (event) => {
  await isAdmin(event)

  const params = (event as any).context?.params as Record<string, string> | undefined
  const userId = params?.id
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'User ID is required' })

  // Read roles from body — expecting JSON { roles: string[] }
  const body = await (event.node.req as any).json?.()
  const roles = body?.roles

  const result = await changeRolesHandler(userId, roles)

  // audit removed per project scope — no-op

  return { status: 200, ...result }
})
