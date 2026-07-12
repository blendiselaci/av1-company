import { motion, useReducedMotion } from 'framer-motion'
import { VideoCard } from '@/features/video/VideoCard'
import type { ProjectCategory, VideoItem } from '@/types'

interface VideoGridProps {
  videos: VideoItem[]
  categoryLabels: Record<ProjectCategory, string>
  onPlay: (index: number) => void
}

export function VideoGrid({ videos, categoryLabels, onPlay }: VideoGridProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {videos.map((video, index) => (
        <motion.article
          key={video.id}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: shouldReduceMotion ? 1 : 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{
            duration: shouldReduceMotion ? 0.01 : 0.6,
            delay: shouldReduceMotion ? 0 : index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <VideoCard video={video} categoryLabel={categoryLabels[video.category]} index={index} onPlay={onPlay} />
        </motion.article>
      ))}
    </div>
  )
}
