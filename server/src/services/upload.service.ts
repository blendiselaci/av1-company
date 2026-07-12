import { Readable } from 'node:stream'
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary'
import { cloudinary } from '../config/cloudinary'
import { env } from '../config/env'
import { logger } from '../utils/logger'

export interface UploadResult {
  url: string
  publicId: string
}

export type AssetResourceType = 'image' | 'video'

function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error instanceof Error ? error : new Error('Cloudinary upload failed'))
        return
      }
      resolve(result)
    })
    Readable.from(buffer).pipe(uploadStream)
  })
}

export async function uploadImage(buffer: Buffer, subfolder = 'images'): Promise<UploadResult> {
  const result = await uploadBuffer(buffer, {
    folder: `${env.CLOUDINARY_UPLOAD_FOLDER}/${subfolder}`,
    resource_type: 'image',
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export async function uploadVideo(buffer: Buffer, subfolder = 'videos'): Promise<UploadResult> {
  const result = await uploadBuffer(buffer, {
    folder: `${env.CLOUDINARY_UPLOAD_FOLDER}/${subfolder}`,
    resource_type: 'video',
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export function uploadAsset(buffer: Buffer, resourceType: AssetResourceType, subfolder?: string): Promise<UploadResult> {
  return resourceType === 'video' ? uploadVideo(buffer, subfolder) : uploadImage(buffer, subfolder)
}

export async function deleteAsset(publicId: string, resourceType: AssetResourceType = 'image'): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

/** Uploads the new asset first, then best-effort deletes the old one — so a
 *  failed upload never leaves a record pointing at a deleted asset. */
export async function replaceAsset(
  buffer: Buffer,
  previousPublicId: string | null | undefined,
  resourceType: AssetResourceType,
  subfolder?: string,
): Promise<UploadResult> {
  const result = await uploadAsset(buffer, resourceType, subfolder)

  if (previousPublicId) {
    try {
      await deleteAsset(previousPublicId, resourceType)
    } catch (error) {
      logger.warn('Failed to delete replaced asset — orphaned in Cloudinary', {
        publicId: previousPublicId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return result
}

export interface OptimizedUrlOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb'
}

/** Builds a transformation URL by naming convention only (no network call) —
 *  Cloudinary rewrites the asset on first request and caches it at the CDN edge
 *  from then on. `fetch_format`/`quality: 'auto'` picks the best format (e.g. AVIF/
 *  WebP) and compression for the requesting browser automatically. */
export function getOptimizedUrl(publicId: string, resourceType: AssetResourceType, options: OptimizedUrlOptions = {}): string {
  const { width, height, crop } = options
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: resourceType,
    fetch_format: 'auto',
    quality: 'auto',
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(width !== undefined || height !== undefined ? { crop: crop ?? 'limit' } : {}),
  })
}

export interface ResponsiveVariants {
  thumbnail: string
  medium: string
  original: string
}

/** A standard set of sizes every image-backed content entity can use (card
 *  thumbnails, detail views, lightbox/original). Videos only get an `original`
 *  (auto-optimized) URL — width/height transforms apply to Cloudinary images, not
 *  video streams, here. */
export function buildResponsiveVariants(publicId: string, resourceType: AssetResourceType): ResponsiveVariants {
  const original = getOptimizedUrl(publicId, resourceType)
  if (resourceType === 'video') {
    return { thumbnail: original, medium: original, original }
  }
  return {
    thumbnail: getOptimizedUrl(publicId, resourceType, { width: 320, crop: 'limit' }),
    medium: getOptimizedUrl(publicId, resourceType, { width: 960, crop: 'limit' }),
    original,
  }
}
