import type { PhotobookConfig } from '~/types/photobook'
import { sameJson } from '~/lib/ids'
import { contentOf, normalize, type PhotobookContent } from '~/lib/photobook'

/**
 * Book Studio projects on this device.
 *
 * A project is the book itself (the full PhotobookConfig — the only model of a book); a position in
 * «Моя подборка» only references it by `projectId`. Projects live in localStorage, one key per
 * project, with no expiry of their own: the 30-day retention of the selection does not apply to
 * them. They are lost only when the visitor clears the browser's site data.
 *
 * Every save carries the version it was based on. If the stored project is newer (another tab or
 * editor saved meanwhile) the save is refused with `conflict` — nothing is overwritten silently.
 */

export interface PhotobookProject {
  id: string
  /** Increments on every save; 0 = never saved. */
  version: number
  createdAt: number
  updatedAt: number
  /** The visitor marked the layout as ready for review. Otherwise the book is «Макет не завершён». */
  layoutComplete: boolean
  config: PhotobookConfig
}

/** The editable part of a project that is versioned and merged. */
export interface ProjectState {
  config: PhotobookConfig
  layoutComplete: boolean
}

const PREFIX = 'momento:book:v1:'

export const projectStorageKey = (id: string) => `${PREFIX}${id}`
export const projectIdFromKey = (key: string | null) => (key?.startsWith(PREFIX) ? key.slice(PREFIX.length) : null)

function parseProject(raw: string | null): PhotobookProject | null {
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as Partial<PhotobookProject>
    if (typeof p.id !== 'string' || typeof p.version !== 'number' || !p.config || !Array.isArray(p.config.spreads)) return null
    return {
      id: p.id,
      version: p.version,
      createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
      updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
      layoutComplete: p.layoutComplete === true,
      // Options may have changed since the project was saved: keep it orderable.
      config: normalize(p.config),
    }
  } catch {
    return null
  }
}

export function readProject(id: string): PhotobookProject | null {
  try {
    return parseProject(localStorage.getItem(projectStorageKey(id)))
  } catch {
    return null
  }
}

/** All saved projects, most recently changed first. */
export function listProjects(): PhotobookProject[] {
  const projects: PhotobookProject[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const id = projectIdFromKey(localStorage.key(i))
      const project = id ? readProject(id) : null
      if (project) projects.push(project)
    }
  } catch {
    // Storage unavailable.
  }
  return projects.sort((a, b) => b.updatedAt - a.updatedAt)
}

export type SaveResult =
  | { status: 'saved'; project: PhotobookProject }
  | { status: 'conflict'; latest: PhotobookProject }
  | { status: 'failed' }

/** Saves a project if the stored one is still at `baseVersion`. */
export function saveProject(id: string, state: ProjectState, baseVersion: number): SaveResult {
  try {
    const latest = readProject(id)
    if (latest && latest.version !== baseVersion) return { status: 'conflict', latest }
    const now = Date.now()
    const project: PhotobookProject = {
      id,
      version: (latest?.version ?? 0) + 1,
      createdAt: latest?.createdAt ?? now,
      updatedAt: now,
      layoutComplete: state.layoutComplete,
      config: state.config,
    }
    localStorage.setItem(projectStorageKey(id), JSON.stringify(project))
    return { status: 'saved', project }
  } catch {
    return { status: 'failed' }
  }
}

/* ---------- Comparison and three-way merge ---------- */

type Field = keyof PhotobookContent | 'layoutComplete'

const FIELD_LABELS: Record<Field, string> = {
  format: 'Формат',
  pageCount: 'Количество страниц',
  coverType: 'Тип обложки',
  coverColor: 'Цвет обложки',
  coverTitle: 'Название на обложке',
  coverTitleEnabled: 'Название на обложке',
  coverTitleColor: 'Цвет названия',
  coverTitlePosition: 'Положение названия',
  coverImageId: 'Фото на обложке',
  paperType: 'Бумага',
  endpaperColor: 'Форзац',
  spineColor: 'Корешок',
  extras: 'Дополнительные опции',
  quantity: 'Количество экземпляров',
  selectedCollection: 'Коллекция',
  spreads: 'Развороты и фотографии',
  layoutComplete: 'Статус макета',
}

const FIELDS = Object.keys(FIELD_LABELS) as Field[]

function fieldValue(state: ProjectState, field: Field): unknown {
  return field === 'layoutComplete' ? state.layoutComplete : contentOf(state.config)[field]
}

/** Same book (view state such as the open spread is ignored). */
export function sameState(a: ProjectState, b: ProjectState): boolean {
  return a.layoutComplete === b.layoutComplete && sameJson(contentOf(a.config), contentOf(b.config))
}

/** Fields changed both here and in the newer version, to different values. */
export function conflictingFields(base: ProjectState, mine: ProjectState, theirs: ProjectState): string[] {
  const labels = FIELDS.filter((field) => {
    const b = fieldValue(base, field)
    const m = fieldValue(mine, field)
    const t = fieldValue(theirs, field)
    return !sameJson(m, b) && !sameJson(t, b) && !sameJson(m, t)
  }).map((field) => FIELD_LABELS[field])
  return [...new Set(labels)]
}

/**
 * «Повторно применить мои изменения»: start from the newer version and re-apply only the fields
 * this editor actually changed. Changes of the other editor in every other field are kept; in a
 * conflicting field this editor's value wins (the visitor chose that, seeing the field list).
 */
export function mergeStates(base: ProjectState, mine: ProjectState, theirs: ProjectState): ProjectState {
  const config = { ...theirs.config, activeView: mine.config.activeView, activeSpreadId: mine.config.activeSpreadId }
  let layoutComplete = theirs.layoutComplete
  for (const field of FIELDS) {
    if (sameJson(fieldValue(mine, field), fieldValue(base, field))) continue
    if (field === 'layoutComplete') layoutComplete = mine.layoutComplete
    else (config as Record<string, unknown>)[field] = mine.config[field]
  }
  return { config: normalize(config), layoutComplete }
}
