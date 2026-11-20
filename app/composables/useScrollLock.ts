/**
 * Page scroll lock shared by every modal surface (dialogs, drawer, mobile menu).
 * Counted, so closing a dialog that was opened over the drawer does not unlock the page behind
 * the still-open drawer.
 */
let locks = 0

export function lockScroll() {
  if (import.meta.server) return
  locks++
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  if (import.meta.server) return
  locks = Math.max(0, locks - 1)
  if (!locks) document.documentElement.style.overflow = ''
}

/** Ties the lock to a boolean (dialog open state); releases it on unmount. */
export function useScrollLock(active: Ref<boolean>) {
  let held = false
  const sync = (value: boolean) => {
    if (value && !held) {
      held = true
      lockScroll()
    } else if (!value && held) {
      held = false
      unlockScroll()
    }
  }
  watch(active, sync)
  onMounted(() => sync(active.value))
  onBeforeUnmount(() => sync(false))
}
