/* eslint-disable react-refresh/only-export-components -- this is a router config module, not a
   component file; it intentionally pairs lazy() route bindings with the non-component `router` export. */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/RootLayout'
import { RouteErrorFallback } from '@/app/RouteErrorFallback'
import { ROUTES } from '@/lib/routes'
import { HomePage } from '@/pages/HomePage'

// HomePage is eager (it's the landing route); every other page is code-split
// so the initial bundle only pays for what a first-time visitor actually sees.
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })))
const TransformationsPage = lazy(() =>
  import('@/pages/TransformationsPage').then((m) => ({ default: m.TransformationsPage })),
)
const GalleryPage = lazy(() => import('@/pages/GalleryPage').then((m) => ({ default: m.GalleryPage })))
const VideoPage = lazy(() => import('@/pages/VideoPage').then((m) => ({ default: m.VideoPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const PrivacyPolicyPage = lazy(() =>
  import('@/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })),
)
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.about.slice(1), element: <AboutPage /> },
      { path: ROUTES.services.slice(1), element: <ServicesPage /> },
      { path: ROUTES.projects.slice(1), element: <ProjectsPage /> },
      { path: ROUTES.transformations.slice(1), element: <TransformationsPage /> },
      { path: ROUTES.gallery.slice(1), element: <GalleryPage /> },
      { path: ROUTES.video.slice(1), element: <VideoPage /> },
      { path: ROUTES.contact.slice(1), element: <ContactPage /> },
      { path: ROUTES.privacy.slice(1), element: <PrivacyPolicyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
