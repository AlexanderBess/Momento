import { CART_STORAGE_KEY, parseStoredCart } from '~/composables/useCart'

/**
 * Loads the saved request from localStorage after hydration (the server always renders an empty
 * cart, so reading earlier would cause a hydration mismatch) and mirrors changes made in other tabs.
 */
export default defineNuxtPlugin(() => {
  const { items, ready } = useCart()

  const load = () => {
    try {
      items.value = parseStoredCart(localStorage.getItem(CART_STORAGE_KEY))
    } catch {
      items.value = []
    }
    ready.value = true
  }

  // Not `app:mounted`: pages hydrate inside <Suspense> after that hook, and changing the cart then
  // causes hydration mismatches. onNuxtReady runs once hydration is fully complete.
  onNuxtReady(load)

  window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) load()
  })
})
