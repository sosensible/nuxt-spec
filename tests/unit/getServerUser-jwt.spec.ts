import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import crypto from 'crypto'
import * as authModule from '../../server/utils/auth'

function base64url(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function signHs256(header: object, payload: object, secret: string) {
  const headerB = base64url(Buffer.from(JSON.stringify(header)))
  const payloadB = base64url(Buffer.from(JSON.stringify(payload)))
  const toSign = headerB + '.' + payloadB
  const sig = crypto.createHmac('sha256', secret).update(toSign).digest()
  const sigB = base64url(sig)
  return `${toSign}.${sigB}`
}

describe('getServerUser (HS256 JWT)', () => {
  const TEST_SECRET = 'test-secret'
  beforeEach(() => {
    process.env.SERVER_JWT_SECRET = TEST_SECRET
  })
  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.SERVER_JWT_SECRET
  })

  it('returns user for valid token', async () => {
    const userId = 'user_abc123'
    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = { sub: userId, exp: Math.floor(Date.now() / 1000) + 60 }
    const token = signHs256(header, payload, TEST_SECRET)

    // Mock fetchUserById and fetchTeamDerivedLabels inside auth module
    const mockUser = { id: userId, email: 'a@b.com', labels: ['admin'] }
    vi.spyOn(authModule as any, 'fetchUserById').mockResolvedValue(mockUser)
    vi.spyOn(authModule as any, 'fetchTeamDerivedLabels').mockResolvedValue([])

    const event = { node: { req: { headers: { authorization: `Bearer ${token}` } } } } as unknown as any
    const res = await authModule.getServerUser(event as any)
    expect(res).toBeTruthy()
    expect(res?.id).toBe(userId)
    expect(res?.labels).toContain('admin')
  })

  it('rejects expired token', async () => {
    const userId = 'user_abc123'
    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = { sub: userId, exp: Math.floor(Date.now() / 1000) - 60 }
    const token = signHs256(header, payload, TEST_SECRET)

    const event = { node: { req: { headers: { authorization: `Bearer ${token}` } } } } as unknown as any
    const res = await authModule.getServerUser(event as any)
    expect(res).toBeNull()
  })
})
