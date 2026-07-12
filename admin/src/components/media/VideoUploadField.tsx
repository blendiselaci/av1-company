import { useRef, useState } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { Loader2, RefreshCw, VideoIcon, X } from 'lucide-react'
import { replaceMedia, uploadMedia } from '../../api/media'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'
import { cn } from '../../lib/utils'
import type { ImageValue } from './ImageUploadField'

interface VideoUploadFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
  required?: boolean
  error?: string
}

/** Same upload/replace-in-place behavior as ImageUploadField, but for the video
 *  file itself (category is always VIDEO) with a native <video> preview. */
export function VideoUploadField<T extends FieldValues>({ name, control, label, required, error }: VideoUploadFieldProps<T>) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaIdRef = useRef<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = field.value as ImageValue | null

        async function handleFile(file: File) {
          setIsUploading(true)
          try {
            if (mediaIdRef.current) {
              const media = await replaceMedia(mediaIdRef.current, file)
              field.onChange({ url: media.url, publicId: media.publicId })
            } else {
              const media = await uploadMedia(file, 'VIDEO')
              mediaIdRef.current = media.id
              field.onChange({ url: media.url, publicId: media.publicId })
            }
          } catch (uploadError) {
            toast.error('Upload failed', extractErrorMessage(uploadError))
          } finally {
            setIsUploading(false)
          }
        }

        return (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              {label} {required && <span className="text-danger">*</span>}
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFile(file)
                event.target.value = ''
              }}
            />

            {value?.url ? (
              <div className="flex items-center gap-4">
                <video src={value.url} className="h-24 w-40 rounded-lg border border-border object-cover" muted />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-background"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    )}
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      mediaIdRef.current = null
                      field.onChange(null)
                    }}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-danger hover:bg-danger/10"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                  const file = event.dataTransfer.files?.[0]
                  if (file) void handleFile(file)
                }}
                disabled={isUploading}
                className={cn(
                  'flex h-24 w-full max-w-xs flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-sm text-muted transition-colors',
                  isDragging ? 'border-brand bg-brand/5 text-brand' : 'border-border hover:border-brand/50',
                )}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <VideoIcon className="h-5 w-5" aria-hidden="true" />
                )}
                <span>Click or drag a video here</span>
              </button>
            )}

            {error && (
              <p role="alert" className="text-xs text-danger">
                {error}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}
