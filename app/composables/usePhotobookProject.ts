import type { CartAddResult } from '~/types/cart'
import type { PhotobookConfig } from '~/types/photobook'
import { DEFAULT_PRESET } from '~/config/photobook/presets'
import { createId } from '~/lib/ids'
import { createConfig } from '~/lib/photobook'
import {
  conflictingFields,
  listProjects,
  mergeStates,
  projectIdFromKey,
  readProject,
  saveProject,
  sameState,
  type PhotobookProject,
  type ProjectState,
  type SaveResult,
} from '~/lib/photobookProjects'
import { photobookItem, photobookKey } from '~/lib/selection'

/**
 * The Book Studio project that is open in the studio, and its link to «Моя подборка».
 *
 * - The studio autosaves the project (debounced) — saving never adds the book to the selection.
 * - If the book is already in the selection, every successful save updates that position in place
 *   (same position id). A position removed from the selection is never re-created by a save.
 * - Saves are version-checked (lib/photobookProjects.ts). A newer version saved elsewhere is
 *   adopted silently when there are no local changes, otherwise the visitor resolves a conflict.
 */

const BOOK_SAVED_EVENT = 'momento:book-saved'
const CURRENT_KEY = 'momento:book-current'
const AUTOSAVE_DELAY = 700

/** Tells other editors in this tab that a project was saved (other tabs get a `storage` event). */
export function announceBookSaved(id: string, source: string) {
  window.dispatchEvent(new CustomEvent(BOOK_SAVED_EVENT, { detail: { id, source } }))
}

/** Updates the selection position of a project if there is one; never adds it. */
export function syncPhotobookPosition(cart: ReturnType<typeof useCart>, project: PhotobookProject) {
  const item = cart.find(photobookKey(project.id))
  if (item) cart.update(item.id, photobookItem(project))
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

let saveTimer: ReturnType<typeof setTimeout> | undefined

export function usePhotobookProject() {
  const studio = usePhotobookStudio()
  const cart = useCart()

  const projectId = useState<string | null>('book-project-id', () => null)
  /** Last saved (or loaded) version and content — the base of the next save and of a merge. */
  const base = useState<{ version: number; state: ProjectState } | null>('book-project-base', () => null)
  const layoutComplete = useState('book-layout-complete', () => false)
  const saveStatus = useState<'idle' | 'saved' | 'failed'>('book-save-status', () => 'idle')
  const conflict = useState<{ latest: PhotobookProject; fields: string[] } | null>('book-conflict', () => null)

  const current = computed<ProjectState>(() => ({ config: studio.config.value, layoutComplete: layoutComplete.value }))
  const dirty = computed(() => !base.value || !sameState(base.value.state, current.value))
  const position = computed(() => (projectId.value ? cart.find(photobookKey(projectId.value)) : undefined))

  function rememberCurrent(id: string) {
    try {
      sessionStorage.setItem(CURRENT_KEY, id)
    } catch {
      // Not important.
    }
  }

  /** Opens a stored project in the studio. */
  function adopt(project: PhotobookProject) {
    clearTimeout(saveTimer)
    projectId.value = project.id
    studio.replaceConfig(project.config)
    layoutComplete.value = project.layoutComplete
    base.value = { version: project.version, state: clone({ config: studio.config.value, layoutComplete: project.layoutComplete }) }
    conflict.value = null
    saveStatus.value = 'saved'
    rememberCurrent(project.id)
  }

  /** Starts a new, not yet saved project from the current studio content. */
  function startNew() {
    clearTimeout(saveTimer)
    projectId.value = createId('book')
    layoutComplete.value = false
    base.value = { version: 0, state: clone(current.value) }
    conflict.value = null
    saveStatus.value = 'idle'
    rememberCurrent(projectId.value)
  }

  function save(): SaveResult | null {
    clearTimeout(saveTimer)
    const id = projectId.value
    if (!id || !base.value || conflict.value) return null
    // Untouched new book: nothing worth storing yet.
    if (!dirty.value) return null
    const state = clone(current.value)
    const result = saveProject(id, state, base.value.version)
    if (result.status === 'saved') {
      base.value = { version: result.project.version, state }
      saveStatus.value = 'saved'
      syncPhotobookPosition(cart, result.project)
      announceBookSaved(id, 'studio')
    } else if (result.status === 'conflict') {
      conflict.value = { latest: result.latest, fields: conflictingFields(base.value.state, state, result.latest) }
    } else {
      saveStatus.value = 'failed'
    }
    return result
  }

  function scheduleSave() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(save, AUTOSAVE_DELAY)
  }

  /** Another tab or editor saved this project: take it over, or raise a conflict if we have changes. */
  function reconcile() {
    const id = projectId.value
    if (!id || !base.value) return
    const latest = readProject(id)
    if (!latest || latest.version === base.value.version) return
    if (!dirty.value) adopt(latest)
    else conflict.value = { latest, fields: conflictingFields(base.value.state, current.value, latest) }
  }

  /** Conflict → «Загрузить актуальную версию»: local unsaved changes are dropped. */
  function loadLatest() {
    const id = projectId.value
    const latest = (id && readProject(id)) || conflict.value?.latest
    if (latest) adopt(latest)
  }

  /** Conflict → «Повторно применить мои изменения» on top of the newer version. */
  function reapplyMine() {
    const id = projectId.value
    const latest = (id && readProject(id)) || conflict.value?.latest
    if (!id || !latest || !base.value) return
    const merged = mergeStates(base.value.state, current.value, latest)
    studio.replaceConfig(merged.config)
    layoutComplete.value = merged.layoutComplete
    base.value = { version: latest.version, state: clone(latest) }
    conflict.value = null
    save()
  }

  /**
   * «Добавить в заказ» / «Оформить заказ»: saves the project first, then adds or updates its
   * position. `conflict` → the visitor has to resolve the conflict first.
   */
  function addToSelection(): CartAddResult | 'conflict' {
    if (conflict.value) return 'conflict'
    if (!projectId.value) startNew()
    const result = base.value?.version === 0 && !dirty.value
      ? saveProject(projectId.value!, clone(current.value), 0) // an untouched new book is saved on add
      : save()
    if (result?.status === 'conflict') return 'conflict'
    if (result?.status === 'saved' && base.value?.version === 0) {
      base.value = { version: result.project.version, state: clone(current.value) }
      saveStatus.value = 'saved'
    }
    return cart.add(photobookItem({ id: projectId.value!, config: current.value.config, layoutComplete: current.value.layoutComplete }))
  }

  /** Opens another saved project (the current one is saved first). */
  function open(id: string) {
    if (id === projectId.value) return
    save()
    const project = readProject(id)
    if (project) adopt(project)
  }

  /** «Новая книга»: saves the current one and starts a fresh book. */
  function createNew(config: PhotobookConfig = createConfig(DEFAULT_PRESET, studio.config.value)) {
    save()
    studio.replaceConfig({ ...config, quantity: 1 })
    startNew()
  }

  return {
    projectId: computed(() => projectId.value),
    layoutComplete,
    saveStatus: computed(() => saveStatus.value),
    conflict: computed(() => conflict.value),
    dirty,
    position,
    inSelection: computed(() => Boolean(position.value)),
    listProjects,
    setLayoutComplete: (value: boolean) => (layoutComplete.value = value),
    save,
    scheduleSave,
    reconcile,
    loadLatest,
    reapplyMine,
    addToSelection,
    open,
    createNew,
    adopt,
    startNew,
  }
}

/**
 * Wires the open project to storage for the lifetime of the studio component: loads the project
 * (`?project=` → this tab's last one → the most recent one), autosaves, follows other tabs.
 */
export function useBookStudioSession() {
  const project = usePhotobookProject()
  const studio = usePhotobookStudio()
  const route = useRoute()

  let stopWatch: (() => void) | undefined

  function openFromRoute() {
    const requested = typeof route.query.project === 'string' ? route.query.project : null
    const requestedProject = requested ? readProject(requested) : null
    if (requestedProject) {
      if (requestedProject.id !== project.projectId.value) {
        project.save()
        project.adopt(requestedProject)
      } else project.reconcile()
      return
    }
    if (project.projectId.value) {
      project.reconcile()
      return
    }
    let last: string | null
    try {
      last = sessionStorage.getItem(CURRENT_KEY)
    } catch {
      last = null
    }
    const stored = (last && readProject(last)) || listProjects()[0]
    if (stored) project.adopt(stored)
    else project.startNew()
  }

  const onStorage = (event: StorageEvent) => {
    if (projectIdFromKey(event.key) === project.projectId.value) project.reconcile()
  }
  const onSaved = (event: Event) => {
    const detail = (event as CustomEvent<{ id: string; source: string }>).detail
    if (detail.source !== 'studio' && detail.id === project.projectId.value) project.reconcile()
  }
  const onLeave = () => project.save()

  onMounted(() => {
    onNuxtReady(() => {
      openFromRoute()
      stopWatch = watch(
        () => [studio.config.value, project.layoutComplete.value],
        () => {
          if (project.dirty.value && !project.conflict.value) project.scheduleSave()
        },
        { deep: true },
      )
    })
    window.addEventListener('storage', onStorage)
    window.addEventListener(BOOK_SAVED_EVENT, onSaved)
    window.addEventListener('pagehide', onLeave)
  })

  watch(() => route.query.project, () => import.meta.client && openFromRoute())

  onBeforeUnmount(() => {
    stopWatch?.()
    project.save()
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(BOOK_SAVED_EVENT, onSaved)
    window.removeEventListener('pagehide', onLeave)
  })

  return project
}
