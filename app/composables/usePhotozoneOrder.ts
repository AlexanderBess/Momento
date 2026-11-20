import type { CartItemInput } from '~/types/cart'
import { findConcept, findOption, type PhotozoneOptionId } from '~/config/photozones'
import {
  PHOTOZONE_CUSTOM_KEY,
  photozoneCustomItem,
  photozoneReadyItem,
  photozoneReadyKey,
  readPhotozoneConfig,
} from '~/lib/selection'

/**
 * Photo zones page state and its bridge to «Моя подборка».
 *
 * Positions (several per selection, see lib/selection.ts):
 * - ready concept → key `photozones:ready:<conceptId>`. One position per concept: adding the same
 *   concept again with other options updates that position (it is the same photo zone being
 *   re-configured), adding it unchanged does nothing. Different concepts are separate positions.
 * - individual project → key `photozones:custom`, price `null` («Обсуждается»).
 */

export type PhotozoneSelection =
  | { type: 'ready'; conceptId: string; options: PhotozoneOptionId[] }
  | { type: 'custom' }

export function usePhotozoneOrder() {
  const cart = useCart()
  const selectionUi = useSelection()

  /** Last explicit choice on the page — used by the final CTA. */
  const selection = useState<PhotozoneSelection | null>('photozone-selection', () => null)
  /** Options chosen per concept in the details dialog (kept while the visitor is on the page). */
  const drafts = useState<Record<string, PhotozoneOptionId[]>>('photozone-drafts', () => ({}))
  /** Concept shown in the details dialog. */
  const openConceptId = useState<string | null>('photozone-open', () => null)

  /** Options of a concept: the current draft, else what is in the selection. */
  function optionsOf(conceptId: string): PhotozoneOptionId[] {
    if (drafts.value[conceptId]) return drafts.value[conceptId]
    const item = cart.find(photozoneReadyKey(conceptId))
    const config = item ? readPhotozoneConfig(item.config) : null
    return config?.orderType === 'ready' ? config.options : []
  }

  function openConcept(conceptId: string) {
    drafts.value = { ...drafts.value, [conceptId]: optionsOf(conceptId) }
    openConceptId.value = conceptId
    selection.value = { type: 'ready', conceptId, options: drafts.value[conceptId]! }
  }

  function toggleOption(conceptId: string, optionId: PhotozoneOptionId) {
    const current = optionsOf(conceptId)
    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    drafts.value = { ...drafts.value, [conceptId]: next }
    selection.value = { type: 'ready', conceptId, options: next }
  }

  function readyItemOf(conceptId: string): CartItemInput | null {
    const concept = findConcept(conceptId)
    return concept ? photozoneReadyItem(concept, optionsOf(conceptId)) : null
  }

  /** Item of the current page choice; `null` when nothing is chosen (the caller asks the visitor). */
  function selectionItem(): { item: CartItemInput; label: string } | null {
    const s = selection.value
    if (!s) return null
    if (s.type === 'custom') return { item: customItem(), label: 'Индивидуальный проект' }
    const item = readyItemOf(s.conceptId)
    return item ? { item, label: `«${findConcept(s.conceptId)!.title}»` } : null
  }

  /** The custom project keeps the idea text already written in the selection. */
  function customItem(): CartItemInput {
    const saved = cart.find(PHOTOZONE_CUSTOM_KEY)
    const config = saved ? readPhotozoneConfig(saved.config) : null
    return photozoneCustomItem(config?.orderType === 'custom' ? config.notes : '')
  }

  /** «Добавить к общей заявке» for a concept. */
  async function addReady(conceptId: string) {
    const item = readyItemOf(conceptId)
    if (!item) return null
    selection.value = { type: 'ready', conceptId, options: optionsOf(conceptId) }
    return selectionUi.addToSelection(item, `«${findConcept(conceptId)!.title}»`)
  }

  /** «Отправить заявку» for a concept. */
  async function submitReady(conceptId: string) {
    const item = readyItemOf(conceptId)
    if (!item) return null
    selection.value = { type: 'ready', conceptId, options: optionsOf(conceptId) }
    return selectionUi.submitWith(item)
  }

  async function addCustom() {
    selection.value = { type: 'custom' }
    return selectionUi.addToSelection(customItem(), 'Индивидуальный проект')
  }

  async function submitCustom() {
    selection.value = { type: 'custom' }
    return selectionUi.submitWith(customItem())
  }

  /** Whether the concept is in the selection (with any options). */
  const isInCart = (conceptId: string) => cart.has(photozoneReadyKey(conceptId))

  /** Whether the concept is in the selection with exactly the current options. */
  function isUpToDate(conceptId: string) {
    const item = cart.find(photozoneReadyKey(conceptId))
    const config = item ? readPhotozoneConfig(item.config) : null
    if (config?.orderType !== 'ready') return false
    const current = optionsOf(conceptId)
    return config.options.length === current.length && current.every((id) => config.options.includes(id))
  }

  const selectionLabel = computed(() => {
    const s = selection.value
    if (!s) return null
    if (s.type === 'custom') return 'Индивидуальный проект'
    const concept = findConcept(s.conceptId)
    if (!concept) return null
    const opts = s.options.map((id) => findOption(id)?.label.toLowerCase()).filter(Boolean)
    return `«${concept.title}»${opts.length ? ` + ${opts.join(', ')}` : ''}`
  })

  function reset() {
    selection.value = null
    drafts.value = {}
    openConceptId.value = null
  }

  return {
    selection,
    selectionLabel,
    selectionItem,
    openConceptId,
    optionsOf,
    openConcept,
    toggleOption,
    addReady,
    submitReady,
    addCustom,
    submitCustom,
    isInCart,
    isUpToDate,
    customInCart: computed(() => cart.has(PHOTOZONE_CUSTOM_KEY)),
    reset,
  }
}
