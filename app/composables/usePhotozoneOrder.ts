import type { CartAddResult, CartItem } from '~/types/cart'
import {
  findConcept,
  findOption,
  photozoneOptions,
  photozonePricing,
  type PhotozoneConcept,
  type PhotozoneOptionId,
} from '~/config/photozones'
import { cartLink } from '~/config/navigation'

/**
 * Photo zones page state and its bridge to the shared cart (useCart).
 *
 * Cart positions:
 * - ready concept → key `photozones:ready:<conceptId>`. One position per concept: adding the same
 *   concept again with other options updates that position (it is the same photo zone being
 *   re-configured), adding it unchanged does nothing. Different concepts are separate positions.
 * - individual project → key `photozones:custom`, price `null` («Обсуждается»).
 *
 * `config` of a position: { orderType: 'ready' | 'custom', conceptId, options } — sent with the request.
 */

export type PhotozoneSelection =
  | { type: 'ready'; conceptId: string; options: PhotozoneOptionId[] }
  | { type: 'custom' }

const PAGE = '/services/photozones'
const SERVICE_TITLE = 'Фотозоны'

export const readyKey = (conceptId: string) => `photozones:ready:${conceptId}`
export const CUSTOM_KEY = 'photozones:custom'

/** Price of a concept with options: known sum + whether some part is «обсуждается». */
export function photozonePrice(concept: PhotozoneConcept, options: PhotozoneOptionId[]) {
  const chosen = photozoneOptions.filter((o) => options.includes(o.id))
  const partial = chosen.some((o) => o.price === null)
  const total =
    concept.basePrice === null ? null : concept.basePrice + chosen.reduce((sum, o) => sum + (o.price ?? 0), 0)
  return { total, partial, isDemo: photozonePricing.isDemo }
}

function readyItem(concept: PhotozoneConcept, options: PhotozoneOptionId[]): Omit<CartItem, 'updatedAt'> {
  // Options in catalogue order, so the same choice always serialises the same way.
  const ordered = photozoneOptions.filter((o) => options.includes(o.id)).map((o) => o.id)
  const price = photozonePrice(concept, ordered)
  return {
    key: readyKey(concept.id),
    service: 'photozones',
    title: `${SERVICE_TITLE} — «${concept.title}»`,
    subtitle: 'Готовая фотозона · аренда с доставкой, монтажом и демонтажом',
    details: ordered.length ? ordered.map((id) => findOption(id)!.label) : ['Без дополнительных опций'],
    price: price.total,
    pricePartial: price.partial,
    priceIsDemo: price.total !== null && price.isDemo,
    quantity: 1,
    config: { orderType: 'ready', conceptId: concept.id, options: ordered },
    href: `${PAGE}#collection`,
  }
}

function customItem(): Omit<CartItem, 'updatedAt'> {
  return {
    key: CUSTOM_KEY,
    service: 'photozones',
    title: `${SERVICE_TITLE} — индивидуальный проект`,
    subtitle: 'Оформление под ваше мероприятие · доставка, монтаж и демонтаж',
    details: ['Концепцию и комплектацию согласуем вместе'],
    price: null,
    quantity: 1,
    config: { orderType: 'custom', conceptId: null, options: [] },
    href: `${PAGE}#custom`,
  }
}

/** Concept id of a cart position that can be edited in the photo zone dialog; `null` otherwise. */
export function editablePhotozoneConcept(item: CartItem): string | null {
  if (item.service !== 'photozones' || item.config.orderType !== 'ready') return null
  const id = item.config.conceptId
  return typeof id === 'string' && findConcept(id) ? id : null
}

export function usePhotozoneOrder() {
  const cart = useCart()
  const toast = useToast()
  const route = useRoute()

  /** Last explicit choice on the page — used by the final CTA. */
  const selection = useState<PhotozoneSelection | null>('photozone-selection', () => null)
  /** Options chosen per concept in the details dialog (kept while the visitor is on the page). */
  const drafts = useState<Record<string, PhotozoneOptionId[]>>('photozone-drafts', () => ({}))
  /** Concept shown in the details dialog. */
  const openConceptId = useState<string | null>('photozone-open', () => null)

  /** Options of a concept: what is in the cart, else the current draft. */
  function optionsOf(conceptId: string): PhotozoneOptionId[] {
    if (drafts.value[conceptId]) return drafts.value[conceptId]
    const inCart = cart.find(readyKey(conceptId))?.config.options
    return Array.isArray(inCart) ? (inCart as PhotozoneOptionId[]) : []
  }

  function openConcept(conceptId: string) {
    drafts.value = { ...drafts.value, [conceptId]: optionsOf(conceptId) }
    openConceptId.value = conceptId
    selection.value = { type: 'ready', conceptId, options: drafts.value[conceptId]! }
  }

  /** Opens the dialog to edit a position that is already in the cart (always starts from its saved options). */
  function editConcept(conceptId: string) {
    const saved = cart.find(readyKey(conceptId))?.config.options
    drafts.value = { ...drafts.value, [conceptId]: Array.isArray(saved) ? (saved as PhotozoneOptionId[]) : [] }
    openConceptId.value = conceptId
  }

  /** Forgets unsaved option changes of a concept (closing the editor without saving). */
  function discardDraft(conceptId: string) {
    const { [conceptId]: _, ...rest } = drafts.value
    drafts.value = rest
  }

  function toggleOption(conceptId: string, optionId: PhotozoneOptionId) {
    const current = optionsOf(conceptId)
    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    drafts.value = { ...drafts.value, [conceptId]: next }
    selection.value = { type: 'ready', conceptId, options: next }
  }

  function notify(result: CartAddResult, label: string) {
    // No «go to cart» link when the change is made on the cart page itself.
    const action = route.path === cartLink.to ? undefined : { label: 'Перейти в корзину', to: cartLink.to }
    if (result === 'added') toast.show({ title: 'Фотозоны добавлены в заявку', description: label, action })
    else if (result === 'updated') toast.show({ title: 'Заявка обновлена', description: `${label}: опции изменены`, action })
    else toast.show({ title: 'Уже в заявке', description: `${label} — без изменений`, action, tone: 'info' })
  }

  function addReady(conceptId: string): CartAddResult | null {
    const concept = findConcept(conceptId)
    if (!concept) return null
    const options = optionsOf(conceptId)
    const result = cart.add(readyItem(concept, options))
    selection.value = { type: 'ready', conceptId, options }
    notify(result, `«${concept.title}»`)
    return result
  }

  function addCustom(): CartAddResult {
    const result = cart.add(customItem())
    selection.value = { type: 'custom' }
    notify(result, 'Индивидуальный проект')
    return result
  }

  /** Adds the current selection; `null` when nothing is chosen (the caller asks the visitor). */
  function addSelection(): CartAddResult | null {
    const s = selection.value
    if (!s) return null
    return s.type === 'custom' ? addCustom() : addReady(s.conceptId)
  }

  /** Whether the concept is in the cart with exactly these options. */
  function isInCart(conceptId: string) {
    return cart.has(readyKey(conceptId))
  }

  function isUpToDate(conceptId: string) {
    const item = cart.find(readyKey(conceptId))
    if (!item) return false
    const saved = (item.config.options as string[] | undefined) ?? []
    const current = optionsOf(conceptId)
    return saved.length === current.length && current.every((id) => saved.includes(id))
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
    openConceptId,
    optionsOf,
    openConcept,
    editConcept,
    discardDraft,
    toggleOption,
    addReady,
    addCustom,
    addSelection,
    isInCart,
    isUpToDate,
    customInCart: computed(() => cart.has(CUSTOM_KEY)),
    reset,
  }
}
