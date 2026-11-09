import type { EventType } from '~/config/order'

/**
 * Event type chosen on the booth page (event cards → booking block).
 * Shared page state; it is passed to /order as `?event=` and is not persisted anywhere else.
 */
export function useBoothEvent() {
  return useState<EventType | null>('booth-event', () => null)
}
