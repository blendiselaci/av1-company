import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { ToastProvider } from '../ui/Toast'
import { ImageUploadField, type ImageValue } from './ImageUploadField'

const { mockUploadMedia, mockReplaceMedia } = vi.hoisted(() => ({
  mockUploadMedia: vi.fn(),
  mockReplaceMedia: vi.fn(),
}))

vi.mock('../../api/media', () => ({
  uploadMedia: mockUploadMedia,
  replaceMedia: mockReplaceMedia,
}))

interface FormValues {
  image: ImageValue | null
}

function Harness() {
  const { control } = useForm<FormValues>({ defaultValues: { image: null } })
  return (
    <ToastProvider>
      <ImageUploadField name="image" control={control} label="Cover image" category="PROJECT_COVER" />
    </ToastProvider>
  )
}

function makeFile(name = 'photo.jpg') {
  return new File(['fake-bytes'], name, { type: 'image/jpeg' })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ImageUploadField', () => {
  it('shows an empty dropzone with no image selected', () => {
    const { container } = render(<Harness />)
    expect(screen.getByText('Click or drag an image here')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('uploads the file on first select and shows a preview', async () => {
    const user = userEvent.setup()
    mockUploadMedia.mockResolvedValue({ id: 'media_1', url: 'https://cdn.example.com/photo.jpg', publicId: 'photo' })
    const { container } = render(<Harness />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, makeFile())

    await waitFor(() => expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/photo.jpg'))
    expect(mockUploadMedia).toHaveBeenCalledWith(expect.any(File), 'PROJECT_COVER')
    expect(mockReplaceMedia).not.toHaveBeenCalled()
  })

  it('replaces via the same media id once an image has already been uploaded', async () => {
    const user = userEvent.setup()
    mockUploadMedia.mockResolvedValue({ id: 'media_1', url: 'https://cdn.example.com/first.jpg', publicId: 'first' })
    mockReplaceMedia.mockResolvedValue({ id: 'media_1', url: 'https://cdn.example.com/second.jpg', publicId: 'second' })
    const { container } = render(<Harness />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, makeFile('first.jpg'))
    await waitFor(() => expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/first.jpg'))

    await user.click(screen.getByRole('button', { name: /Replace/ }))
    await user.upload(input, makeFile('second.jpg'))

    await waitFor(() => expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/second.jpg'))
    expect(mockReplaceMedia).toHaveBeenCalledWith('media_1', expect.any(File))
    expect(mockUploadMedia).toHaveBeenCalledTimes(1)
  })

  it('removing the image clears the field without calling any delete endpoint', async () => {
    const user = userEvent.setup()
    mockUploadMedia.mockResolvedValue({ id: 'media_1', url: 'https://cdn.example.com/photo.jpg', publicId: 'photo' })
    const { container } = render(<Harness />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, makeFile())
    await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Remove/ }))

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('Click or drag an image here')).toBeInTheDocument()
  })
})
