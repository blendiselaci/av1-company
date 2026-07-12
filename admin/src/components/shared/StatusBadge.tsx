import { Badge } from '../ui/Badge'

export function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return <Badge variant={isPublished ? 'success' : 'neutral'}>{isPublished ? 'Published' : 'Draft'}</Badge>
}
