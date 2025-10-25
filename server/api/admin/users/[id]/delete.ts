import { defineEventHandler, createError } from 'h3'
import { deleteUser as appwriteDeleteUser } from '../../../../utils/appwrite-admin'
import isAdmin from '../../../../middleware/isAdmin'

// Delete user handler (testable)
export async function deleteUserHandler(userId: string) {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  await appwriteDeleteUser(userId)
  return { success: true }
}

export default defineEventHandler(async (event) => {
  // enforce admin
  await isAdmin(event)

  const params = (event as any).context?.params as Record<string, string> | undefined
  const userId = params?.id
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'User ID is required' })

  const result = await deleteUserHandler(userId)
  // audit removed per project scope — no-op

  return { status: 200, ...result }
})
