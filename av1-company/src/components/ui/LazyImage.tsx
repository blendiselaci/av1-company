import { useState } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  /** Wrapper classes — control the reserved box (aspect ratio, rounding, absolute fill, ...). */
  className?: string
  /** Extra classes applied to the <img> itself, e.g. group-hover zoom. */
  imgClassName?: string
  /** 'cover' reserves a skeleton box and fills it (gallery tiles, thumbnails). 'contain'
   *  is for images whose box is sized by their own content (lightbox). */
  fit?: 'cover' | 'contain'
  draggable?: boolean
  onError?: () => void
}

/** Shared image loader: skeleton shimmer while pending, blur-up + fade-in + slight
 *  scale-settle once the browser finishes decoding the source. */
export function LazyImage({ src, alt, className, imgClassName, fit = 'cover', draggable = true, onError }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)

  if (fit === 'contain') {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={draggable}
        onLoad={() => setLoaded(true)}
        onError={onError}
        className={cn(
          'transition-all duration-700 ease-out motion-reduce:transition-none',
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-[1.02] opacity-0 blur-lg motion-reduce:scale-100 motion-reduce:blur-0',
          className,
          imgClassName,
        )}
      />
    )
  }

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(120,120,120,0.08)_8%,rgba(120,120,120,0.18)_18%,rgba(120,120,120,0.08)_33%)] bg-[length:200%_100%] motion-reduce:animate-none"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={draggable}
        onLoad={() => setLoaded(true)}
        onError={onError}
        className={cn(
          'h-full w-full object-cover transition-all duration-700 ease-out motion-reduce:transition-none',
          loaded
            ? 'scale-100 opacity-100 blur-0'
            : 'scale-105 opacity-0 blur-lg motion-reduce:scale-100 motion-reduce:blur-0',
          imgClassName,
        )}
      />
    </div>
  )
}
