import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Media } from '@prisma/client'

const { mockMediaRepository, mockUploadAsset, mockDeleteAsset, mockReplaceAsset, mockBuildResponsiveVariants } = vi.hoisted(
  () => ({
    mockMediaRepository: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    mockUploadAsset: vi.fn(),
    mockDeleteAsset: vi.fn(),
    mockReplaceAsset: vi.fn(),
    mockBuildResponsiveVariants: vi.fn(),
  }),
)

vi.mock('../repositories/media.repository', () => ({ mediaRepository: mockMediaRepository }))
vi.mock('./upload.service', () => ({
  uploadAsset: mockUploadAsset,
  deleteAsset: mockDeleteAsset,
  replaceAsset: mockReplaceAsset,
  buildResponsiveVariants: mockBuildResponsiveVariants,
}))

import {
  createManyMedia,
  createMedia,
  deleteMedia,
  getMediaById,
  getOptimizedVariants,
  listMedia,
  replaceMedia,
} from './media.service'
import { NotFoundError } from '../utils/AppError'

function buildMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: 'media_1',
    url: 'https://res.cloudinary.com/demo/image/upload/v1/av1-company/gallery/photo.jpg',
    publicId: 'av1-company/gallery/photo',
    resourceType: 'IMAGE',
    category: 'GALLERY',
    mimeType: 'image/jpeg',
    sizeBytes: 123_456,
    uploadedById: 'user_1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

function buildUploadedFile(overrides: Partial<{ buffer: Buffer; mimetype: string; size: number }> = {}) {
  return { buffer: Buffer.from('fake'), mimetype: 'image/jpeg', size: 123_456, ...overrides }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createMedia', () => {
  it('uploads into the category subfolder and stores a Media record', async () => {
    mockUploadAsset.mockResolvedValue({ url: 'https://cdn/x.jpg', publicId: 'av1-company/gallery/x' })
    const created = buildMedia()
    mockMediaRepository.create.mockResolvedValue(created)

    const result = await createMedia(buildUploadedFile(), 'GALLERY', 'user_1')

    expect(mockUploadAsset).toHaveBeenCalledWith(expect.any(Buffer), 'image', 'gallery')
    expect(mockMediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://cdn/x.jpg',
        publicId: 'av1-company/gallery/x',
        resourceType: 'IMAGE',
        category: 'GALLERY',
        uploadedById: 'user_1',
      }),
    )
    expect(result).toEqual(created)
  })

  it('maps a video mimetype to the video resource type and subfolder', async () => {
    mockUploadAsset.mockResolvedValue({ url: 'https://cdn/x.mp4', publicId: 'av1-company/videos/x' })
    mockMediaRepository.create.mockResolvedValue(buildMedia({ resourceType: 'VIDEO', category: 'VIDEO' }))

    await createMedia(buildUploadedFile({ mimetype: 'video/mp4' }), 'VIDEO', 'user_1')

    expect(mockUploadAsset).toHaveBeenCalledWith(expect.any(Buffer), 'video', 'videos')
    expect(mockMediaRepository.create).toHaveBeenCalledWith(expect.objectContaining({ resourceType: 'VIDEO' }))
  })
})

describe('createManyMedia', () => {
  it('uploads every file and returns one Media record per file', async () => {
    mockUploadAsset.mockResolvedValue({ url: 'https://cdn/x.jpg', publicId: 'av1-company/gallery/x' })
    mockMediaRepository.create.mockResolvedValue(buildMedia())

    const result = await createManyMedia([buildUploadedFile(), buildUploadedFile()], 'GALLERY', 'user_1')

    expect(result).toHaveLength(2)
    expect(mockUploadAsset).toHaveBeenCalledTimes(2)
  })
})

describe('getMediaById', () => {
  it('returns the record when found', async () => {
    const media = buildMedia()
    mockMediaRepository.findUnique.mockResolvedValue(media)
    await expect(getMediaById('media_1')).resolves.toEqual(media)
  })

  it('throws NotFoundError when missing', async () => {
    mockMediaRepository.findUnique.mockResolvedValue(null)
    await expect(getMediaById('missing')).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('listMedia', () => {
  it('filters by category and returns pagination meta', async () => {
    const items = [buildMedia()]
    mockMediaRepository.findMany.mockResolvedValue(items)
    mockMediaRepository.count.mockResolvedValue(1)

    const result = await listMedia({ page: 1, limit: 20, category: 'GALLERY' })

    expect(mockMediaRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category: 'GALLERY' } }),
    )
    expect(result.items).toEqual(items)
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 })
  })

  it('applies no category filter when omitted', async () => {
    mockMediaRepository.findMany.mockResolvedValue([])
    mockMediaRepository.count.mockResolvedValue(0)

    await listMedia({ page: 1, limit: 20 })

    expect(mockMediaRepository.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }))
  })
})

describe('replaceMedia', () => {
  it('replaces the Cloudinary asset and updates the existing record in place', async () => {
    const existing = buildMedia()
    mockMediaRepository.findUnique.mockResolvedValue(existing)
    mockReplaceAsset.mockResolvedValue({ url: 'https://cdn/new.jpg', publicId: 'av1-company/gallery/new' })
    const updated = buildMedia({ url: 'https://cdn/new.jpg', publicId: 'av1-company/gallery/new' })
    mockMediaRepository.update.mockResolvedValue(updated)

    const result = await replaceMedia('media_1', buildUploadedFile())

    expect(mockReplaceAsset).toHaveBeenCalledWith(expect.any(Buffer), existing.publicId, 'image', 'gallery')
    expect(mockMediaRepository.update).toHaveBeenCalledWith(
      { id: 'media_1' },
      expect.objectContaining({ url: 'https://cdn/new.jpg', publicId: 'av1-company/gallery/new' }),
    )
    expect(result).toEqual(updated)
  })

  it('throws NotFoundError when the media record does not exist', async () => {
    mockMediaRepository.findUnique.mockResolvedValue(null)
    await expect(replaceMedia('missing', buildUploadedFile())).rejects.toBeInstanceOf(NotFoundError)
    expect(mockReplaceAsset).not.toHaveBeenCalled()
  })
})

describe('deleteMedia', () => {
  it('deletes the DB record and the Cloudinary asset with the correct resource type', async () => {
    const media = buildMedia({ resourceType: 'VIDEO' })
    mockMediaRepository.findUnique.mockResolvedValue(media)
    mockMediaRepository.delete.mockResolvedValue(media)
    mockDeleteAsset.mockResolvedValue(undefined)

    await deleteMedia('media_1')

    expect(mockMediaRepository.delete).toHaveBeenCalledWith({ id: 'media_1' })
    expect(mockDeleteAsset).toHaveBeenCalledWith(media.publicId, 'video')
  })

  it('does not throw if the Cloudinary deletion fails (record is already gone)', async () => {
    const media = buildMedia()
    mockMediaRepository.findUnique.mockResolvedValue(media)
    mockMediaRepository.delete.mockResolvedValue(media)
    mockDeleteAsset.mockRejectedValue(new Error('Cloudinary is down'))

    await expect(deleteMedia('media_1')).resolves.toBeUndefined()
  })

  it('throws NotFoundError when the media record does not exist', async () => {
    mockMediaRepository.findUnique.mockResolvedValue(null)
    await expect(deleteMedia('missing')).rejects.toBeInstanceOf(NotFoundError)
    expect(mockMediaRepository.delete).not.toHaveBeenCalled()
  })
})

describe('getOptimizedVariants', () => {
  it('maps the Prisma resource type to the Cloudinary resource type', () => {
    mockBuildResponsiveVariants.mockReturnValue({ thumbnail: 't', medium: 'm', original: 'o' })

    const result = getOptimizedVariants(buildMedia({ resourceType: 'VIDEO', publicId: 'x' }))

    expect(mockBuildResponsiveVariants).toHaveBeenCalledWith('x', 'video')
    expect(result).toEqual({ thumbnail: 't', medium: 'm', original: 'o' })
  })
})
