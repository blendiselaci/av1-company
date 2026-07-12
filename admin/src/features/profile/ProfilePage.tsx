import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, ShieldCheck, UserCircle } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { PageHeader } from '../../components/shared/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageHeader title="Profile" description="Your account details for this dashboard." />

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-semibold text-brand-foreground">
            {initials}
          </span>
          <div>
            <p className="text-lg font-semibold text-foreground">{user.name}</p>
            <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>{user.role}</Badge>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
            <dt className="sr-only">Email</dt>
            <dd className="text-foreground">{user.email}</dd>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted" aria-hidden="true" />
            <dt className="sr-only">Role</dt>
            <dd className="text-foreground">{user.role === 'ADMIN' ? 'Administrator' : 'Editor'}</dd>
          </div>
          <div className="flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-muted" aria-hidden="true" />
            <dt className="sr-only">Member since</dt>
            <dd className="text-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-border pt-4">
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}
