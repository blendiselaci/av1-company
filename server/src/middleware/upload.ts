import multer from 'multer'
import { BadRequestError } from '../utils/AppError'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25MB — comfortably covers a compressed photo or short video clip

/** Buffers the upload in memory so it can be streamed straight to Cloudinary
 *  without ever touching disk. Suitable for the file sizes this site handles;
 *  swap to disk storage first if very large video uploads become common. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestError(`Unsupported file type: ${file.mimetype}`))
      return
    }
    callback(null, true)
  },
})
