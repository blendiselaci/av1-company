import { describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'
import { sanitizeBody } from './sanitize'

function buildRequest(body: unknown): Request {
  return { body } as Request
}

describe('sanitizeBody', () => {
  it('strips HTML/script markup from string fields', () => {
    const req = buildRequest({ title: '<script>alert(1)</script>Hello' })
    sanitizeBody(req, {} as Response, vi.fn())
    expect(req.body).toEqual({ title: 'Hello' })
  })

  it('recurses into nested objects and arrays', () => {
    const req = buildRequest({
      nested: { text: '<b>bold</b>value' },
      list: ['<i>one</i>', 'two'],
    })
    sanitizeBody(req, {} as Response, vi.fn())
    expect(req.body).toEqual({ nested: { text: 'boldvalue' }, list: ['one', 'two'] })
  })

  it('leaves a password field completely untouched, including HTML-like characters', () => {
    const req = buildRequest({ email: 'admin@example.com', password: 'P@ss<word>123' })
    sanitizeBody(req, {} as Response, vi.fn())
    // The exact original value must survive — mutating it here would silently
    // corrupt a real password before it's hashed or compared against a hash.
    expect(req.body).toEqual({ email: 'admin@example.com', password: 'P@ss<word>123' })
  })

  it('calls next()', () => {
    const next = vi.fn()
    sanitizeBody(buildRequest({ a: '<p>x</p>' }), {} as Response, next)
    expect(next).toHaveBeenCalledWith()
  })
})
