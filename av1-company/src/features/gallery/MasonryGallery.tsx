import { motion, useReducedMotion } from 'framer-motion'
import { GalleryCard } from '@/features/gallery/GalleryCard'
import type { GalleryItem, ProjectCategory } from '@/types'

// Repeating aspect-ratio pattern so placeholder tiles read as a natural masonry layout.
const HEIGHT_PATTERN = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]', 'aspect-[4/5]', 'aspect-square']

interface MasonryGalleryProps {
  items: GalleryItem[]
  categoryLabels: Record<'all' | ProjectCategory, string>
  onSelect: (index: number) => void
}

export function MasonryGallery({ items, categoryLabels, onSelect }: MasonryGalleryProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      {items.map((item, index) => (
        <motion.figure
          key={item.id}
          layout
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0.01 : 0.5,
            delay: shouldReduceMotion ? 0 : (index % 6) * 0.05,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="m-0 mb-6 break-inside-avoid"
        >
          <GalleryCard
            item={item}
            categoryLabel={categoryLabels[item.category]}
            heightClass={HEIGHT_PATTERN[index % HEIGHT_PATTERN.length]}
            index={index}
            onOpen={onSelect}
          />
          <figcaption className="sr-only">
            {item.title} — {categoryLabels[item.category]}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  )
}
