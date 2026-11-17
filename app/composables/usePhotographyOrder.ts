import type { PhotographyExtraId, PhotographyPackageId } from '~/config/photography'
import { buildOrderLink } from '~/config/order'
import type { ServiceSlug } from '~/types/service'

interface PhotographySelection {
  package: PhotographyPackageId | null
  extras: PhotographyExtraId[]
  bundle: ServiceSlug[]
}

/**
 * Choices made on the photography page (package, add-ons, other services for the same order).
 * Page-scoped state: it only shapes the link into the shared order flow (`/order?…`, see config/order.ts),
 * there is no separate cart or booking. Every CTA on the page uses the same `orderLink`.
 */
export function usePhotographyOrder() {
  const selection = useState<PhotographySelection>('photography-order', () => ({
    package: null,
    extras: [],
    bundle: [],
  }))

  const orderLink = computed(() =>
    buildOrderLink({
      service: 'photography',
      package: selection.value.package ?? undefined,
      extras: selection.value.extras,
      bundle: selection.value.bundle,
    }),
  )

  const hasSelection = computed(
    () => Boolean(selection.value.package) || selection.value.extras.length > 0 || selection.value.bundle.length > 0,
  )

  function toggle<T>(items: T[], item: T): T[] {
    return items.includes(item) ? items.filter((i) => i !== item) : [...items, item]
  }

  return {
    selection,
    orderLink,
    hasSelection,
    selectPackage: (id: PhotographyPackageId | null) => (selection.value.package = id),
    toggleExtra: (id: PhotographyExtraId) => (selection.value.extras = toggle(selection.value.extras, id)),
    toggleBundle: (slug: ServiceSlug) => (selection.value.bundle = toggle(selection.value.bundle, slug)),
    reset: () => (selection.value = { package: null, extras: [], bundle: [] }),
  }
}
