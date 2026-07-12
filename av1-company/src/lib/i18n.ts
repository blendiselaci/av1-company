import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import sqCommon from '@/content/locales/sq/common.json'
import enCommon from '@/content/locales/en/common.json'
import deCommon from '@/content/locales/de/common.json'
import sqHome from '@/content/locales/sq/home.json'
import enHome from '@/content/locales/en/home.json'
import deHome from '@/content/locales/de/home.json'
import sqAbout from '@/content/locales/sq/about.json'
import enAbout from '@/content/locales/en/about.json'
import deAbout from '@/content/locales/de/about.json'
import sqProjects from '@/content/locales/sq/projects.json'
import enProjects from '@/content/locales/en/projects.json'
import deProjects from '@/content/locales/de/projects.json'
import sqTransformations from '@/content/locales/sq/transformations.json'
import enTransformations from '@/content/locales/en/transformations.json'
import deTransformations from '@/content/locales/de/transformations.json'
import sqGallery from '@/content/locales/sq/gallery.json'
import enGallery from '@/content/locales/en/gallery.json'
import deGallery from '@/content/locales/de/gallery.json'
import sqVideos from '@/content/locales/sq/videos.json'
import enVideos from '@/content/locales/en/videos.json'
import deVideos from '@/content/locales/de/videos.json'
import sqTestimonials from '@/content/locales/sq/testimonials.json'
import enTestimonials from '@/content/locales/en/testimonials.json'
import deTestimonials from '@/content/locales/de/testimonials.json'
import sqTrust from '@/content/locales/sq/trust.json'
import enTrust from '@/content/locales/en/trust.json'
import deTrust from '@/content/locales/de/trust.json'
import sqFaq from '@/content/locales/sq/faq.json'
import enFaq from '@/content/locales/en/faq.json'
import deFaq from '@/content/locales/de/faq.json'
import sqContact from '@/content/locales/sq/contact.json'
import enContact from '@/content/locales/en/contact.json'
import deContact from '@/content/locales/de/contact.json'
import sqSeo from '@/content/locales/sq/seo.json'
import enSeo from '@/content/locales/en/seo.json'
import deSeo from '@/content/locales/de/seo.json'
import sqPrivacy from '@/content/locales/sq/privacy.json'
import enPrivacy from '@/content/locales/en/privacy.json'
import dePrivacy from '@/content/locales/de/privacy.json'

const STORAGE_KEY = 'av1-lang'
const storedLang = localStorage.getItem(STORAGE_KEY)

i18n.use(initReactI18next).init({
  resources: {
    sq: {
      common: sqCommon,
      home: sqHome,
      about: sqAbout,
      projects: sqProjects,
      transformations: sqTransformations,
      gallery: sqGallery,
      videos: sqVideos,
      testimonials: sqTestimonials,
      trust: sqTrust,
      faq: sqFaq,
      contact: sqContact,
      seo: sqSeo,
      privacy: sqPrivacy,
    },
    en: {
      common: enCommon,
      home: enHome,
      about: enAbout,
      projects: enProjects,
      transformations: enTransformations,
      gallery: enGallery,
      videos: enVideos,
      testimonials: enTestimonials,
      trust: enTrust,
      faq: enFaq,
      contact: enContact,
      seo: enSeo,
      privacy: enPrivacy,
    },
    de: {
      common: deCommon,
      home: deHome,
      about: deAbout,
      projects: deProjects,
      transformations: deTransformations,
      gallery: deGallery,
      videos: deVideos,
      testimonials: deTestimonials,
      trust: deTrust,
      faq: deFaq,
      contact: deContact,
      seo: deSeo,
      privacy: dePrivacy,
    },
  },
  lng: storedLang ?? 'sq',
  fallbackLng: 'sq',
  ns: [
    'common',
    'home',
    'about',
    'projects',
    'transformations',
    'gallery',
    'videos',
    'testimonials',
    'trust',
    'faq',
    'contact',
    'seo',
    'privacy',
  ],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng)
  document.documentElement.lang = lng
})

export default i18n
