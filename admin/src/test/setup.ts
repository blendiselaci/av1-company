import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Not using Vitest's `globals: true` (explicit imports everywhere else in this
// repo), so RTL's own auto-cleanup registration doesn't fire automatically —
// wire it up here instead, once, for every test file.
afterEach(() => {
  cleanup()
})
