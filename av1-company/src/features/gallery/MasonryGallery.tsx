import { motion, useReducedMotion } from 'framer-motion'
import { GalleryCard } from '@/features/gallery/GalleryCard'
import type { GalleryItem } from '@/types'

// Repeating aspect-ratio pattern so placeholder tiles read as a natural masonry layout.
// Kept to 4 evenly-weighted ratios (rather than 6) so the rhythm reads as intentional,
// not chaotic, once tiles wrap across multiple columns.
const HEIGHT_PATTERN = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-square']

interface MasonryGalleryProps {
  items: GalleryItem[]
  getLabel: (categoryId: string | null | undefined) => string
  onSelect: (index: number) => void
}

export function MasonryGallery({ items, getLabel, onSelect }: MasonryGalleryProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="columns-1 gap-4 sm:columns-2 sm:gap-6 lg:columns-3 xl:columns-4">
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
          className="m-0 mb-4 break-inside-avoid sm:mb-6"
        >
          <GalleryCard
            item={item}
            categoryLabel={getLabel(item.categoryId)}
            heightClass={HEIGHT_PATTERN[index % HEIGHT_PATTERN.length]}
            index={index}
            onOpen={onSelect}
          />
          <figcaption className="sr-only">
            {item.title} — {getLabel(item.categoryId)}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  )
}
