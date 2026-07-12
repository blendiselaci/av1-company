import { describe, expect, it } from 'vitest'
import { comparePassword, hashPassword } from './password'

describe('password utils', () => {
  it('hashes a password into a bcrypt digest distinct from the plaintext', async () => {
    const hash = await hashPassword('ChangeMe123!')
    expect(hash).not.toBe('ChangeMe123!')
    expect(hash).toMatch(/^\$2[aby]\$/)
  })

  it('verifies a matching password against its hash', async () => {
    const hash = await hashPassword('ChangeMe123!')
    await expect(comparePassword('ChangeMe123!', hash)).resolves.toBe(true)
  })

  it('rejects a non-matching password', async () => {
    const hash = await hashPassword('ChangeMe123!')
    await expect(comparePassword('WrongPassword!', hash)).resolves.toBe(false)
  })
})
