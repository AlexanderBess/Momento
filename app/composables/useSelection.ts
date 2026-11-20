import type { CartItemInput } from '~/types/cart'
import type { ServiceSlug } from '~/types/service'

/**
 * UI around «Моя подборка»: the drawer, the position editor, and the two actions every service page
 * offers —
 *   · «Добавить к общей заявке» → `addToSelection(item)`: add, stay on the page, quiet toast;
 *   · «Отправить заявку»        → `submitWith(item)`: sync this position, then open /checkout.
 * Both ask before replacing the position of a single-position service (booth, photography).
 */

export const CHECKOUT_PATH = '/checkout'

export type SelectionOutcome = 'added' | 'updated' | 'unchanged' | 'cancelled'

/** Names of single-position services for the replace question. */
const REPLACE_NAMES: Partial<Record<ServiceSlug, { what: string; accusative: string }>> = {
  booth: { what: 'AI-фотобудка', accusative: 'AI-фотобудку' },
  photography: { what: 'фотосъёмка', accusative: 'фотосъёмку' },
}

export function useSelection() {
  const cart = useCart()
  const toast = useToast()
  const confirm = useConfirm()

  const drawerOpen = useState('selection-drawer-open', () => false)
  /** Position open in the editor (by position id). */
  const editingId = useState<string | null>('selection-editing', () => null)

  /**
   * Last change made inside the drawer / checkout list (saved edit, removal): announced in a live
   * region next to the list — toasts would sit behind the modal drawer.
   */
  const notice = useState<{ text: string; itemId: string | null; at: number } | null>('selection-notice', () => null)
  const announce = (text: string, itemId: string | null = null) => (notice.value = { text, itemId, at: Date.now() })

  function removeItem(id: string) {
    const item = cart.findById(id)
    if (!item) return
    cart.remove(id)
    announce(
      item.service === 'photobooks'
        ? `Удалено из подборки: ${item.title}. Проект книги остался в Book Studio.`
        : `Удалено из подборки: ${item.title}.`,
    )
  }

  const openDrawer = () => (drawerOpen.value = true)
  const closeDrawer = () => (drawerOpen.value = false)
  const edit = (id: string) => (editingId.value = id)

  /** Adds/updates; on a different single-position configuration asks whether to replace it. */
  async function put(item: CartItemInput): Promise<SelectionOutcome> {
    const result = cart.add(item)
    if (result !== 'needs-replace') return result
    const current = cart.items.value.find((i) => i.service === item.service)
    const names = REPLACE_NAMES[item.service] ?? { what: item.title, accusative: item.title }
    const answer = await confirm.ask({
      title: `Заменить ${names.accusative} в подборке?`,
      message: `В подборке уже есть ${names.what} с другими параметрами. В заявке может быть только одна такая позиция.`,
      details: [
        { label: 'Сейчас в подборке', lines: current ? [current.subtitle, ...current.details].filter((l): l is string => Boolean(l)) : [] },
        { label: 'Новый вариант', lines: [item.subtitle, ...item.details].filter((l): l is string => Boolean(l)) },
      ],
      confirmLabel: 'Заменить',
      cancelLabel: 'Оставить прежний',
    })
    if (answer !== 'confirm') return 'cancelled'
    cart.add(item, { replace: true })
    return 'updated'
  }

  function notify(outcome: SelectionOutcome, label: string) {
    const action = { label: 'Открыть подборку', run: openDrawer }
    if (outcome === 'added') toast.show({ title: 'Добавлено в подборку', description: label, action })
    else if (outcome === 'updated') toast.show({ title: 'Подборка обновлена', description: label, action })
    else if (outcome === 'unchanged') toast.show({ title: 'Уже в подборке', description: `${label} — без изменений`, action, tone: 'info' })
  }

  /** «Добавить к общей заявке». */
  async function addToSelection(item: CartItemInput, label = item.title): Promise<SelectionOutcome> {
    const outcome = await put(item)
    notify(outcome, label)
    return outcome
  }

  /** «Отправить заявку»: the request form always covers the whole selection. */
  async function submitWith(item: CartItemInput): Promise<SelectionOutcome> {
    const outcome = await put(item)
    if (outcome !== 'cancelled') await goToCheckout()
    return outcome
  }

  async function goToCheckout() {
    closeDrawer()
    editingId.value = null
    await navigateTo(CHECKOUT_PATH)
  }

  return {
    drawerOpen,
    editingId,
    notice,
    announce,
    removeItem,
    openDrawer,
    closeDrawer,
    edit,
    put,
    addToSelection,
    submitWith,
    goToCheckout,
    notify,
  }
}
