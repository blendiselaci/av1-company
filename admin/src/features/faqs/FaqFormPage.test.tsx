import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { ToastProvider } from '../../components/ui/Toast'
import FaqFormPage from './FaqFormPage'

const { mockCreate, mockUpdate, mockGet, mockNavigate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGet: vi.fn(),
  mockNavigate: vi.fn(),
}))

vi.mock('../../api/resources', () => ({
  faqsApi: { create: mockCreate, update: mockUpdate, get: mockGet },
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  vi.clearAllMocks()
})

function renderPage(initialEntry: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/faqs/new" element={<FaqFormPage />} />
            <Route path="/faqs/:id" element={<FaqFormPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

function questionField(locale: 'En' | 'De' | 'Sq') {
  return document.getElementById(`question${locale}`) as HTMLInputElement
}

function answerField(locale: 'En' | 'De' | 'Sq') {
  return document.getElementById(`answer${locale}`) as HTMLTextAreaElement
}

describe('FaqFormPage', () => {
  it('shows a required-field validation error when submitted empty', async () => {
    const user = userEvent.setup()
    renderPage('/faqs/new')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    const errors = await screen.findAllByRole('alert')
    expect(errors.length).toBeGreaterThan(0)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('submits a valid new FAQ and navigates back to the list', async () => {
    const user = userEvent.setup()
    mockCreate.mockResolvedValue({ id: 'faq_1' })
    renderPage('/faqs/new')

    await user.type(questionField('En'), 'Do you ship internationally?')
    await user.type(questionField('De'), 'Versenden Sie international?')
    await user.type(questionField('Sq'), 'A dërgoni ndërkombëtarisht?')
    await user.type(answerField('En'), 'Yes, worldwide.')
    await user.type(answerField('De'), 'Ja, weltweit.')
    await user.type(answerField('Sq'), 'Po, në mbarë botën.')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1))
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        questionEn: 'Do you ship internationally?',
        answerSq: 'Po, në mbarë botën.',
        isPublished: true,
      }),
    )
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/faqs'))
  })

  it('loads existing values in edit mode and submits an update', async () => {
    const user = userEvent.setup()
    mockGet.mockResolvedValue({
      id: 'faq_1',
      questionEn: 'Old question?',
      questionDe: 'Alte Frage?',
      questionSq: 'Pyetje e vjetër?',
      answerEn: 'Old answer.',
      answerDe: 'Alte Antwort.',
      answerSq: 'Përgjigje e vjetër.',
      isPublished: true,
      order: 0,
    })
    mockUpdate.mockResolvedValue({ id: 'faq_1' })

    renderPage('/faqs/faq_1')

    expect(await screen.findByDisplayValue('Old question?')).toBeInTheDocument()

    await user.clear(questionField('En'))
    await user.type(questionField('En'), 'Updated question?')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith('faq_1', expect.objectContaining({ questionEn: 'Updated question?' })))
  })
})
