import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RoleGuard } from './auth/RoleGuard'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { FullPageSpinner } from './components/ui/Spinner'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const DashboardHomePage = lazy(() => import('./features/dashboard/DashboardHomePage'))
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'))

const ProjectsListPage = lazy(() => import('./features/projects/ProjectsListPage'))
const ProjectFormPage = lazy(() => import('./features/projects/ProjectFormPage'))

const GalleryListPage = lazy(() => import('./features/gallery/GalleryListPage'))
const GalleryFormPage = lazy(() => import('./features/gallery/GalleryFormPage'))

const BeforeAfterListPage = lazy(() => import('./features/beforeAfter/BeforeAfterListPage'))
const BeforeAfterFormPage = lazy(() => import('./features/beforeAfter/BeforeAfterFormPage'))

const VideosListPage = lazy(() => import('./features/videos/VideosListPage'))
const VideoFormPage = lazy(() => import('./features/videos/VideoFormPage'))

const ServicesListPage = lazy(() => import('./features/services/ServicesListPage'))
const ServiceFormPage = lazy(() => import('./features/services/ServiceFormPage'))

const TestimonialsListPage = lazy(() => import('./features/testimonials/TestimonialsListPage'))
const TestimonialFormPage = lazy(() => import('./features/testimonials/TestimonialFormPage'))

const FaqsListPage = lazy(() => import('./features/faqs/FaqsListPage'))
const FaqFormPage = lazy(() => import('./features/faqs/FaqFormPage'))

const ContactMessagesListPage = lazy(() => import('./features/contactMessages/ContactMessagesListPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))

const UsersListPage = lazy(() => import('./features/users/UsersListPage'))
const UserFormPage = lazy(() => import('./features/users/UserFormPage'))

export default function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="profile" element={<ProfilePage />} />

            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/new" element={<ProjectFormPage />} />
            <Route path="projects/:id" element={<ProjectFormPage />} />

            <Route path="gallery" element={<GalleryListPage />} />
            <Route path="gallery/new" element={<GalleryFormPage />} />
            <Route path="gallery/:id" element={<GalleryFormPage />} />

            <Route path="before-after" element={<BeforeAfterListPage />} />
            <Route path="before-after/new" element={<BeforeAfterFormPage />} />
            <Route path="before-after/:id" element={<BeforeAfterFormPage />} />

            <Route path="videos" element={<VideosListPage />} />
            <Route path="videos/new" element={<VideoFormPage />} />
            <Route path="videos/:id" element={<VideoFormPage />} />

            <Route path="services" element={<ServicesListPage />} />
            <Route path="services/new" element={<ServiceFormPage />} />
            <Route path="services/:id" element={<ServiceFormPage />} />

            <Route path="testimonials" element={<TestimonialsListPage />} />
            <Route path="testimonials/new" element={<TestimonialFormPage />} />
            <Route path="testimonials/:id" element={<TestimonialFormPage />} />

            <Route path="faqs" element={<FaqsListPage />} />
            <Route path="faqs/new" element={<FaqFormPage />} />
            <Route path="faqs/:id" element={<FaqFormPage />} />

            <Route path="contact-messages" element={<ContactMessagesListPage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route element={<RoleGuard allow={['ADMIN']} />}>
              <Route path="users" element={<UsersListPage />} />
              <Route path="users/new" element={<UserFormPage />} />
              <Route path="users/:id" element={<UserFormPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
