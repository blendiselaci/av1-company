import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Film, Volume2, VolumeX, X } from 'lucide-react'
import { useModalA11y } from '@/hooks/useModalA11y'
import type { VideoItem } from '@/types'

interface ModalVideoPlayerProps {
  video: VideoItem
  muted: boolean
  onToggleMute: () => void
  muteLabel: string
  unmuteLabel: string
}

function ModalVideoPlayer({ video, muted, onToggleMute, muteLabel, unmuteLabel }: ModalVideoPlayerProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="flex aspect-video w-full max-w-4xl items-center justify-center rounded-xl bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]">
        {/* Placeholder — swap for real video source once available */}
        <Film className="h-20 w-20 text-white/20" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-4xl">
      {/* muted attribute is required for autoplay to actually run in Chrome/Safari — native
          controls still expose their own volume slider, this chip is a discoverable shortcut */}
      <video
        src={video.videoUrl}
        poster={video.thumbnail}
        controls
        autoPlay
        muted={muted}
        playsInline
        onError={() => setErrored(true)}
        className="aspect-video w-full rounded-xl bg-black"
      />

      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? unmuteLabel : muteLabel}
        className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  )
}

interface VideoModalProps {
  videos: VideoItem[]
  activeIndex: number | null
  onClose: () => void
  closeLabel: string
  muteLabel?: string
  unmuteLabel?: string
}

export function VideoModal({
  videos,
  activeIndex,
  onClose,
  closeLabel,
  muteLabel = 'Mute',
  unmuteLabel = 'Unmute',
}: VideoModalProps) {
  const shouldReduceMotion = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const isOpen = activeIndex !== null
  const video = activeIndex !== null ? videos[activeIndex] : null
  const [muted, setMuted] = useState(true)

  // Reset to muted whenever a different video is opened. Adjusting state during render
  // (rather than in an effect) avoids an extra cascading render — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevActiveIndex, setPrevActiveIndex] = useState(activeIndex)
  if (activeIndex !== prevActiveIndex) {
    setPrevActiveIndex(activeIndex)
    setMuted(true)
  }

  useModalA11y({ isOpen, onClose, dialogRef, initialFocusRef: closeButtonRef })

  const dialog = video ? (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/95 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-6 sm:top-6"
      >
        <X size={24} />
      </button>

      <ModalVideoPlayer
        video={video}
        muted={muted}
        onToggleMute={() => setMuted((current) => !current)}
        muteLabel={muteLabel}
        unmuteLabel={unmuteLabel}
      />

      <p className="max-w-2xl text-center text-sm text-white/70">{video.description}</p>
    </div>
  ) : null

  if (shouldReduceMotion) {
    return dialog
  }

  return (
    <AnimatePresence>
      {video && (
        <motion.div key="video-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {dialog}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
