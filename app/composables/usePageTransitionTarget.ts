import type { TransitionPreset } from '~/types/service'

/** Theme of the page being navigated to (set by plugins/page-transitions.client.ts). */
export function usePageTransitionTarget() {
  return useState<TransitionPreset>('page-transition-target', () => 'neutral')
}
