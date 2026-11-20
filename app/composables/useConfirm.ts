/**
 * Site-wide confirmation dialog (rendered once by ConfirmHost in layouts/default.vue).
 *
 *   const answer = await useConfirm().ask({ title: 'Заменить фотобудку?', confirmLabel: 'Заменить' })
 *   // 'confirm' | 'cancel' | 'dismiss' (closed with Esc / ✕ / backdrop)
 *
 * It opens on top of any other dialog (native top layer), so it also works over the selection
 * drawer and the position editors.
 */
export interface ConfirmRequest {
  title: string
  message?: string
  /** Extra lines, e.g. the options of the configuration being replaced. */
  details?: { label: string; lines: string[] }[]
  confirmLabel: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
}

export type ConfirmAnswer = 'confirm' | 'cancel' | 'dismiss'

interface PendingConfirm extends ConfirmRequest {
  id: number
}

let nextId = 1
const resolvers = new Map<number, (answer: ConfirmAnswer) => void>()

export function useConfirm() {
  const pending = useState<PendingConfirm | null>('confirm-pending', () => null)

  function ask(request: ConfirmRequest): Promise<ConfirmAnswer> {
    if (import.meta.server) return Promise.resolve('dismiss')
    // A new question closes an unanswered one.
    if (pending.value) answer(pending.value.id, 'dismiss')
    const id = nextId++
    pending.value = { ...request, id }
    return new Promise((resolve) => resolvers.set(id, resolve))
  }

  function answer(id: number, value: ConfirmAnswer) {
    resolvers.get(id)?.(value)
    resolvers.delete(id)
    if (pending.value?.id === id) pending.value = null
  }

  return { pending, ask, answer }
}
