import { CART_STORAGE_KEY } from '~/composables/useCart'

/**
 * Loads the saved selection from localStorage after hydration (the server always renders an empty
 * selection, so reading earlier would cause a hydration mismatch), drops it when it expired, and
 * mirrors changes made in other tabs.
 */
export default defineNuxtPlugin(() => {
  const { load } = useCart()

  // Not `app:mounted`: pages hydrate inside <Suspense> after that hook, and changing the cart then
  // causes hydration mismatches. onNuxtReady runs once hydration is fully complete.
  onNuxtReady(load)

  window.addEventListener('storage', (event) => {
    // `key === null` → storage was cleared in another tab.
    if (event.key === CART_STORAGE_KEY || event.key === null) load()
  })
})
