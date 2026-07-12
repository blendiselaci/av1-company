import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

export function FormActions({ backTo, saving }: { backTo: string; saving: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="flex justify-end gap-2 border-t border-border pt-4">
      <Button type="button" variant="secondary" onClick={() => navigate(backTo)} disabled={saving}>
        Cancel
      </Button>
      <Button type="submit" loading={saving}>
        Save
      </Button>
    </div>
  )
}
