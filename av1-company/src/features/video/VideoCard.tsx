import { memo, useState } from 'react'
import { Film, Play } from 'lucide-react'
import { LazyImage } from '@/components/ui/LazyImage'
import logo from '@/assets/logo-av1-header.jpg'
import type { VideoItem } from '@/types'

interface VideoCardProps {
  video: VideoItem
  categoryLabel: string
  index: number
  onPlay: (index: number) => void
}

function VideoCardComponent({ video, categoryLabel, index, onPlay }: VideoCardProps) {
  const [errored, setErrored] = useState(false)

  return (
    <button
      type="button"
      onClick={() => onPlay(index)}
      aria-label={video.title}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl"
    >
      {!errored ? (
        <LazyImage
          src={video.thumbnail}
          alt={video.title}
          onError={() => setErrored(true)}
          imgClassName="group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]">
          {/* Placeholder — swap for real video thumbnail once available */}
          <Film className="h-14 w-14 text-white/20" aria-hidden="true" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0 transition-colors duration-300 group-hover:from-black/80" />

      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="absolute left-4 top-4 h-9 w-9 rounded-full object-cover shadow-lg ring-2 ring-white/40"
      />

      <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
        {video.duration}
      </span>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-av1-dark shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Play size={26} className="translate-x-0.5" fill="currentColor" aria-hidden="true" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-av1-green-light">{categoryLabel}</p>
        <p className="text-sm font-semibold text-white">{video.title}</p>
      </div>
    </button>
  )
}

export const VideoCard = memo(VideoCardComponent)
