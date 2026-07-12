import { useRef, useState } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadMultipleMedia } from '../../api/media'
import type { MediaCategory } from '../../types/models'
import { useToast } from '../../hooks/useToast'
import { extractErrorMessage } from '../../lib/errors'
import { cn } from '../../lib/utils'

interface MultiImageUploadFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
  category: MediaCategory
}

/** Backs a `string[]` of image URLs (e.g. a project's extra gallery shots).
 *  Supports selecting or dropping several files at once via /media/upload/multiple. */
export function MultiImageUploadField<T extends FieldValues>({ name, control, label, category }: MultiImageUploadFieldProps<T>) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const urls = (field.value as string[] | undefined) ?? []

        async function handleFiles(files: FileList | File[]) {
          const list = Array.from(files)
          if (list.length === 0) return
          setIsUploading(true)
          try {
            const media = await uploadMultipleMedia(list, category)
            field.onChange([...urls, ...media.map((item) => item.url)])
          } catch (uploadError) {
            toast.error('Upload failed', extractErrorMessage(uploadError))
          } finally {
            setIsUploading(false)
          }
        }

        function handleRemove(url: string) {
          field.onChange(urls.filter((existing) => existing !== url))
        }

        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{label}</p>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) void handleFiles(event.target.files)
                event.target.value = ''
              }}
            />

            <div className="flex flex-wrap gap-3">
              {urls.map((url) => (
                <div key={url} className="group relative h-20 w-20 shrink-0">
                  <img src={url} alt="" className="h-20 w-20 rounded-lg border border-border object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-danger p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}

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
                  if (event.dataTransfer.files) void handleFiles(event.dataTransfer.files)
                }}
                disabled={isUploading}
                className={cn(
                  'flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted transition-colors',
                  isDragging ? 'border-brand bg-brand/5 text-brand' : 'border-border hover:border-brand/50',
                )}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="text-[10px]">Add</span>
              </button>
            </div>
          </div>
        )
      }}
    />
  )
}
