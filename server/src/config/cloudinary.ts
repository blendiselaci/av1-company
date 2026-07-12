import { v2 as cloudinary } from 'cloudinary'
import { env } from './env'

/**
 * Cloudinary SDK configured from environment variables.
 *
 * The .env.example ships with placeholder credentials — swap
 * CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET for a
 * real account before deploying. Every call site goes through
 * `services/upload.service.ts`, so that's the only other place that needs
 * touching if the storage provider ever changes.
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }
