import { memo, useState } from 'react'
import { LazyImage } from '@/components/ui/LazyImage'
import { CATEGORY_ICONS } from '@/lib/categoryIcons'
import { cn } from '@/lib/utils'
import type { GalleryItem } from '@/types'

interface GalleryCardProps {
  item: GalleryItem
  categoryLabel: string
  heightClass: string
  index: number
  onOpen: (index: number) => void
}

function GalleryCardComponent({ item, categoryLabel, heightClass, index, onOpen }: GalleryCardProps) {
  const [errored, setErrored] = useState(false)
  const Icon = CATEGORY_ICONS[item.category]

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={cn('group relative block w-full overflow-hidden rounded-2xl', heightClass)}
    >
      {!errored ? (
        <LazyImage
          src={item.image}
          alt={item.title}
          onError={() => setErrored(true)}
          imgClassName="group-hover:scale-110"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]">
          {/* Placeholder — swap for real photography once available */}
          <Icon
            className="h-14 w-14 text-white/20 transition-transform duration-700 ease-out group-hover:scale-110"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-av1-green-light">{categoryLabel}</p>
        <p className="text-sm font-semibold text-white">{item.title}</p>
      </div>
    </button>
  )
}

export const GalleryCard = memo(GalleryCardComponent)
