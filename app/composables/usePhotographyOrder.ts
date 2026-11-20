import type { PhotographyExtraId, PhotographyFormatId, PhotographyPackageId } from '~/config/photography'
import { emptyPhotographyConfig, photographyItem, readPhotographyConfig, type PhotographyConfig } from '~/lib/selection'

/**
 * Choices made on the photography page (direction, package, add-ons) and their bridge to
 * «Моя подборка», where photography is one position.
 *
 * The page starts from the position already in the selection (if any), so «Отправить заявку»
 * with no new choices never asks to replace it with an empty one. A different choice asks first.
 */
export function usePhotographyOrder() {
  const cart = useCart()
  const selectionUi = useSelection()

  const selection = useState<PhotographyConfig>('photography-order', emptyPhotographyConfig)
  /** The visitor changed something on this page visit (then the saved position no longer overrides). */
  const touched = useState('photography-order-touched', () => false)

  /** Takes over the saved position once the selection is loaded (only if nothing was chosen yet). */
  function syncFromSelection() {
    if (touched.value) return
    const saved = cart.find('photography')
    selection.value = saved ? readPhotographyConfig(saved.config) : emptyPhotographyConfig()
  }

  const item = computed(() => photographyItem(selection.value))
  const hasSelection = computed(
    () => Boolean(selection.value.package) || selection.value.extras.length > 0 || Boolean(selection.value.direction),
  )
  const inSelection = computed(() => cart.has('photography'))

  function change(patch: Partial<PhotographyConfig>) {
    touched.value = true
    selection.value = { ...selection.value, ...patch }
  }

  const toggle = <T,>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((i) => i !== value) : [...list, value])

  return {
    selection,
    item,
    hasSelection,
    inSelection,
    syncFromSelection,
    selectPackage: (id: PhotographyPackageId | null) => change({ package: id }),
    selectDirection: (id: PhotographyFormatId | null) => change({ direction: id }),
    toggleExtra: (id: PhotographyExtraId) => change({ extras: toggle(selection.value.extras, id) }),
    addToSelection: () => selectionUi.addToSelection(item.value, 'Фотосъёмка'),
    submit: () => selectionUi.submitWith(item.value),
    reset: () => {
      touched.value = false
      selection.value = emptyPhotographyConfig()
    },
  }
}
