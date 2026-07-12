import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useConfirm } from './useConfirm'

function TestHarness({ onResolved }: { onResolved: (result: boolean) => void }) {
  const { confirm, dialog } = useConfirm()

  async function handleClick() {
    const result = await confirm({ title: 'Delete project', description: 'This cannot be undone.' })
    onResolved(result)
  }

  return (
    <div>
      <button onClick={handleClick}>Trigger</button>
      {dialog}
    </div>
  )
}

describe('useConfirm', () => {
  it('resolves true when the user confirms', async () => {
    const user = userEvent.setup()
    const results: boolean[] = []
    render(<TestHarness onResolved={(r) => results.push(r)} />)

    await user.click(screen.getByRole('button', { name: 'Trigger' }))
    expect(await screen.findByText('Delete project')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(results).toEqual([true])
  })

  it('resolves false when the user cancels', async () => {
    const user = userEvent.setup()
    const results: boolean[] = []
    render(<TestHarness onResolved={(r) => results.push(r)} />)

    await user.click(screen.getByRole('button', { name: 'Trigger' }))
    await screen.findByText('This cannot be undone.')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(results).toEqual([false])
  })
})
