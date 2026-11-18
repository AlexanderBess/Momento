/**
 * Site-wide notifications (rendered once by ToastHost in layouts/default.vue).
 *
 *   const toast = useToast()
 *   toast.show({ title: 'Фотозоны добавлены в заявку', action: { label: 'Перейти в корзину', to: '/checkout' } })
 *
 * A toast never navigates by itself; the optional action is a link the visitor may follow.
 */
export interface Toast {
  id: number
  title: string
  description?: string
  action?: { label: string; to: string }
  tone?: 'success' | 'info'
}

const DURATION = 6000

let nextId = 1
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: number) {
    clearTimeout(timers.get(id))
    timers.delete(id)
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function schedule(id: number) {
    clearTimeout(timers.get(id))
    timers.set(
      id,
      setTimeout(() => dismiss(id), DURATION),
    )
  }

  function show(toast: Omit<Toast, 'id'>) {
    if (import.meta.server) return
    const id = nextId++
    // One message at a time is enough here: a newer one replaces the older ones.
    for (const t of toasts.value) dismiss(t.id)
    toasts.value = [...toasts.value, { tone: 'success', ...toast, id }]
    schedule(id)
  }

  /** Hover / focus keeps the toast open; leaving restarts the timer. */
  const pause = (id: number) => clearTimeout(timers.get(id))
  const resume = (id: number) => schedule(id)

  return { toasts, show, dismiss, pause, resume }
}
