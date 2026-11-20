import type { EventType } from '~/config/order'
import { boothItem, readBoothConfig, type BoothDesignId } from '~/lib/selection'

/**
 * Event type chosen on the booth page (event cards → booking block).
 * Page state; it becomes part of the booth position in «Моя подборка».
 */
export function useBoothEvent() {
  return useState<EventType | null>('booth-event', () => null)
}

/**
 * The booth configuration on its page — event type + design wishes — and its bridge to
 * «Моя подборка», where the booth is a single position. The page starts from the saved position,
 * so sending again with no new choices never asks to replace it.
 */
export function useBoothOrder() {
  const cart = useCart()
  const selectionUi = useSelection()
  const event = useBoothEvent()
  const design = useState<BoothDesignId[]>('booth-design', () => [])

  function syncFromSelection() {
    if (event.value || design.value.length) return
    const saved = cart.find('booth')
    if (!saved) return
    const config = readBoothConfig(saved.config)
    event.value = config.eventType
    design.value = config.design
  }

  const item = computed(() => boothItem({ eventType: event.value, design: design.value }))

  return {
    event,
    design,
    item,
    inSelection: computed(() => cart.has('booth')),
    syncFromSelection,
    toggleDesign: (id: BoothDesignId) =>
      (design.value = design.value.includes(id) ? design.value.filter((d) => d !== id) : [...design.value, id]),
    addToSelection: () => selectionUi.addToSelection(item.value, 'AI-фотобудка'),
    submit: () => selectionUi.submitWith(item.value),
    reset: () => {
      event.value = null
      design.value = []
    },
  }
}
