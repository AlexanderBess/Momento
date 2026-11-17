<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import type { NavItem } from '~/types/navigation'

/**
 * Desktop header dropdown (disclosure pattern: a button that shows a list of links).
 * Opens on mouse hover or click; closes on mouse leave (debounced), outside click, Esc,
 * focus leaving the menu and route change. Arrow keys / Home / End move between links.
 */
const props = defineProps<{ item: NavItem }>()

const CLOSE_DELAY = 180

const open = ref(false)
// Opened by hover → the first click "pins" it instead of toggling it straight back closed.
const openedByHover = ref(false)

const root = useTemplateRef<HTMLDivElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const panelId = useId()

let closeTimer: ReturnType<typeof setTimeout> | undefined
const cancelClose = () => clearTimeout(closeTimer)

function show({ viaHover = false } = {}) {
  cancelClose()
  if (!open.value) openedByHover.value = viaHover
  open.value = true
}

function hide({ restoreFocus = false } = {}) {
  cancelClose()
  open.value = false
  openedByHover.value = false
  if (restoreFocus) trigger.value?.focus()
}

// Hover only for real mice: on touch, pointerenter + click would open and instantly close.
function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'mouse') show({ viaHover: true })
  else cancelClose()
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  cancelClose()
  closeTimer = setTimeout(() => hide(), CLOSE_DELAY)
}

function onTriggerClick() {
  if (open.value && openedByHover.value) openedByHover.value = false
  else if (open.value) hide()
  else show()
}

function links(): HTMLAnchorElement[] {
  return Array.from(root.value?.querySelectorAll<HTMLAnchorElement>('[data-nav-dropdown-link]') ?? [])
}

async function focusLink(index: number) {
  if (!open.value) show()
  await nextTick()
  const list = links()
  if (!list.length) return
  list[(index + list.length) % list.length]?.focus()
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusLink(0)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusLink(-1)
  }
}

function onPanelKeydown(event: KeyboardEvent) {
  const list = links()
  const current = list.indexOf(document.activeElement as HTMLAnchorElement)
  const moves: Record<string, number> = {
    ArrowDown: current + 1,
    ArrowUp: current - 1,
    Home: 0,
    End: -1,
  }
  const target = moves[event.key]
  if (target === undefined) return
  event.preventDefault()
  focusLink(target)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    hide({ restoreFocus: true })
  }
}

// Tabbing out of the trigger + panel closes the menu.
function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (open.value && next && !root.value?.contains(next)) hide()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) hide()
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) document.addEventListener('pointerdown', onDocumentPointerDown)
  else document.removeEventListener('pointerdown', onDocumentPointerDown)
})

const route = useRoute()
watch(
  () => route.fullPath,
  () => hide(),
)

// The section trigger reads as current on any of its child pages.
const sectionActive = computed(() => route.path.startsWith(`${props.item.to}/`))

onBeforeUnmount(() => {
  cancelClose()
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div
    ref="root"
    class="relative"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @keydown="onKeydown"
    @focusout="onFocusOut"
  >
    <button
      ref="trigger"
      type="button"
      class="relative inline-flex items-center gap-1 rounded-button px-3.5 py-2 text-sm font-medium transition-colors duration-(--motion-fast) hover:text-text"
      :class="open || sectionActive ? 'text-text' : 'text-text/80'"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      {{ item.label }}
      <ChevronDown
        class="size-3.5 text-muted-soft transition-transform duration-(--motion-normal) ease-standard"
        :class="open && 'rotate-180'"
        :stroke-width="1.75"
        aria-hidden="true"
      />
    </button>

    <Transition
      enter-active-class="transition-[opacity,translate] duration-(--motion-normal) ease-enter"
      leave-active-class="transition-[opacity,translate] duration-(--motion-fast) ease-standard"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <!-- pt-2 is an invisible hover bridge between the trigger and the card. -->
      <div v-show="open" :id="panelId" class="absolute top-full -left-2 w-[22rem] pt-2" @keydown="onPanelKeydown">
        <div class="rounded-card border border-border/70 bg-surface p-2 shadow-soft">
          <ul>
            <li v-for="child in item.children" :key="child.to">
              <NuxtLink
                :to="child.to"
                data-nav-dropdown-link
                class="group block rounded-button px-3.5 py-3 transition-colors duration-(--motion-fast) hover:bg-bg focus-visible:bg-bg aria-[current=page]:bg-bg"
                @click="hide()"
              >
                <span class="block text-sm font-medium text-text">{{ child.label }}</span>
                <span v-if="child.description" class="mt-0.5 block text-[0.8125rem] leading-snug text-muted">
                  {{ child.description }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>
