import { describe, expect, it } from 'vitest'
import { cloudinaryThumbnail } from './cloudinary'

describe('cloudinaryThumbnail', () => {
  it('inserts a resize/format transformation right after /upload/', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/av1-company/projects/tirana/main.jpg'
    expect(cloudinaryThumbnail(url, 80)).toBe(
      'https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill,f_auto,q_auto/v1/av1-company/projects/tirana/main.jpg',
    )
  })

  it('defaults to an 80px thumbnail when no size is given', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/x/y.jpg'
    expect(cloudinaryThumbnail(url)).toContain('w_80,h_80')
  })

  it('respects a custom size', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/x/y.jpg'
    expect(cloudinaryThumbnail(url, 200)).toContain('w_200,h_200')
  })

  it('returns non-Cloudinary URLs unchanged rather than risk producing a broken one', () => {
    const url = 'https://example.com/not-cloudinary.jpg'
    expect(cloudinaryThumbnail(url)).toBe(url)
  })
})
