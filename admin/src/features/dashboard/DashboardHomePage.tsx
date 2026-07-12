import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FolderKanban,
  HelpCircle,
  Image,
  Mail,
  MessageSquareQuote,
  Plus,
  Video,
} from 'lucide-react'
import { faqsApi, galleryApi, projectsApi, testimonialsApi, videosApi } from '../../api/resources'
import * as contactApi from '../../api/contactMessages'
import { SummaryCard } from '../../components/shared/SummaryCard'
import { PageHeader } from '../../components/shared/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../auth/useAuth'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export default function DashboardHomePage() {
  const { user } = useAuth()

  const projectsQuery = useQuery({ queryKey: ['dashboard', 'projects'], queryFn: () => projectsApi.list({ page: 1, limit: 5 }) })
  const galleryQuery = useQuery({ queryKey: ['dashboard', 'gallery'], queryFn: () => galleryApi.list({ page: 1, limit: 5 }) })
  const videosQuery = useQuery({ queryKey: ['dashboard', 'videos'], queryFn: () => videosApi.list({ page: 1, limit: 1 }) })
  const testimonialsQuery = useQuery({ queryKey: ['dashboard', 'testimonials'], queryFn: () => testimonialsApi.list({ page: 1, limit: 1 }) })
  const faqsQuery = useQuery({ queryKey: ['dashboard', 'faqs'], queryFn: () => faqsApi.list({ page: 1, limit: 1 }) })
  const messagesQuery = useQuery({
    queryKey: ['dashboard', 'messages'],
    queryFn: () => contactApi.listContactMessages({ page: 1, limit: 5 }),
  })

  const cards = [
    { label: 'Total Projects', value: projectsQuery.data?.meta.total, icon: FolderKanban, to: '/projects', isLoading: projectsQuery.isLoading },
    { label: 'Gallery Images', value: galleryQuery.data?.meta.total, icon: Image, to: '/gallery', isLoading: galleryQuery.isLoading },
    { label: 'Videos', value: videosQuery.data?.meta.total, icon: Video, to: '/videos', isLoading: videosQuery.isLoading },
    { label: 'Contact Messages', value: messagesQuery.data?.meta.total, icon: Mail, to: '/contact-messages', isLoading: messagesQuery.isLoading },
    { label: 'Testimonials', value: testimonialsQuery.data?.meta.total, icon: MessageSquareQuote, to: '/testimonials', isLoading: testimonialsQuery.isLoading },
    { label: 'FAQs', value: faqsQuery.data?.meta.total, icon: HelpCircle, to: '/faqs', isLoading: faqsQuery.isLoading },
  ]

  const recentItems = [
    ...(projectsQuery.data?.items ?? []).map((item) => ({ id: item.id, label: item.titleEn, type: 'Project', date: item.createdAt, to: `/projects/${item.id}` })),
    ...(galleryQuery.data?.items ?? []).map((item) => ({ id: item.id, label: item.titleEn, type: 'Gallery', date: item.createdAt, to: `/gallery/${item.id}` })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  const isLoadingActivity = projectsQuery.isLoading || galleryQuery.isLoading

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back${user ? `, ${user.name.split(' ')[0]}` : ''}`} description="Here's what's happening across the site." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Recent Activity</h2>
          {isLoadingActivity ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ul className="divide-y divide-border">
              {recentItems.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link to={item.to} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-brand">
                    <span className="truncate">
                      <Badge variant="neutral">{item.type}</Badge> <span className="ml-2 text-foreground">{item.label}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(item.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Latest Contact Messages</h2>
            <Link to="/contact-messages" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </div>
          {messagesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (messagesQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No messages yet" />
          ) : (
            <ul className="divide-y divide-border">
              {messagesQuery.data!.items.map((message) => (
                <li key={message.id}>
                  <Link to="/contact-messages" className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-brand">
                    <span className="truncate text-foreground">
                      {message.firstName} {message.lastName}
                    </span>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(message.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/projects/new">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Project
            </Button>
          </Link>
          <Link to="/gallery/new">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Gallery Image
            </Button>
          </Link>
          <Link to="/testimonials/new">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Testimonial
            </Button>
          </Link>
          <Link to="/contact-messages">
            <Button variant="secondary" size="sm">
              <Mail className="h-4 w-4" aria-hidden="true" />
              View Messages
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
