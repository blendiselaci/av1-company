import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { DataTable, type Column } from './DataTable'

interface Item {
  id: string
  name: string
}

const items: Item[] = [
  { id: '1', name: 'Banana' },
  { id: '2', name: 'Apple' },
  { id: '3', name: 'Cherry' },
]

const columns: Column<Item>[] = [{ key: 'name', header: 'Name', sortValue: (item) => item.name, render: (item) => item.name }]

const meta = { page: 1, limit: 20, total: 3, totalPages: 1 }

function renderTable(overrides: Partial<ComponentProps<typeof DataTable<Item>>> = {}) {
  return render(
    <DataTable
      columns={columns}
      items={items}
      meta={meta}
      isLoading={false}
      isError={false}
      onRetry={vi.fn()}
      onPageChange={vi.fn()}
      getSearchText={(item) => item.name}
      {...overrides}
    />,
  )
}

function bodyRowText() {
  return screen.getAllByRole('row').slice(1).map((row) => row.textContent)
}

describe('DataTable', () => {
  it('renders every row', () => {
    renderTable()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('filters rows by the search box, client-side', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.type(screen.getByRole('textbox', { name: 'Search this list' }), 'app')

    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument()
  })

  it('cycles a sortable column through ascending, descending, then back to original order', async () => {
    const user = userEvent.setup()
    renderTable()

    const header = screen.getByRole('button', { name: /Name/ })

    await user.click(header)
    expect(bodyRowText()).toEqual(['Apple', 'Banana', 'Cherry'])

    await user.click(header)
    expect(bodyRowText()).toEqual(['Cherry', 'Banana', 'Apple'])

    await user.click(header)
    expect(bodyRowText()).toEqual(['Banana', 'Apple', 'Cherry'])
  })

  it('bulk-selects rows and calls onBulkDelete with exactly the selected ids', async () => {
    const user = userEvent.setup()
    const onBulkDelete = vi.fn().mockResolvedValue(undefined)
    renderTable({ canBulkDelete: true, onBulkDelete })

    const checkboxes = screen.getAllByRole('checkbox', { name: 'Select row' })
    await user.click(checkboxes[0]!)
    await user.click(checkboxes[1]!)

    await user.click(screen.getByRole('button', { name: /Delete 2 selected/ }))

    expect(onBulkDelete).toHaveBeenCalledTimes(1)
    expect(onBulkDelete.mock.calls[0]![0]).toEqual(expect.arrayContaining(['1', '2']))
    expect(onBulkDelete.mock.calls[0]![0]).toHaveLength(2)
  })

  it('does not render selection checkboxes when bulk delete is disabled', () => {
    renderTable()
    expect(screen.queryByRole('checkbox', { name: 'Select row' })).not.toBeInTheDocument()
  })

  it('shows an empty state when there are no results', () => {
    renderTable({ items: [] })
    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('shows an error state and lets the caller retry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderTable({ isError: true, onRetry })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
