import { useCallback, useState } from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
}

/** Imperative confirm-before-destructive-action pattern: `await confirm({...})`
 *  resolves `true`/`false` instead of every page hand-rolling its own dialog
 *  open/close state for "are you sure?" prompts (bulk delete, single delete, ...). */
export function useConfirm() {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (value: boolean) => void } | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setState({ options, resolve }))
  }, [])

  const respond = (value: boolean) => {
    state?.resolve(value)
    setState(null)
  }

  const dialog = (
    <ConfirmDialog
      isOpen={state !== null}
      title={state?.options.title ?? ''}
      description={state?.options.description ?? ''}
      confirmLabel={state?.options.confirmLabel}
      danger={state?.options.danger}
      onConfirm={() => respond(true)}
      onCancel={() => respond(false)}
    />
  )

  return { confirm, dialog }
}
