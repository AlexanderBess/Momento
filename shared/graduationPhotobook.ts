import { findGraduationTemplate, graduationInstitutions, type GraduationInstitution } from '../app/config/photobook/graduation'
import { isDeliveryDate, photobookDeliveryDetail } from './photobookCollection'

export const GRADUATION_PHOTOBOOK_ORDER = 'graduation-group'

export const graduationPhotography = {
  momento: 'Фотосъёмка MOMENTO',
  provided: 'Свои фотографии',
} as const

type GraduationPhotography = keyof typeof graduationPhotography

export interface GraduationOrder {
  orderType: typeof GRADUATION_PHOTOBOOK_ORDER
  institutionType: GraduationInstitution
  templateId: string
  children: number
  additionalCopies: number
  photography: GraduationPhotography
  desiredDeliveryDate?: string
  preferredPhotographyDate?: string
}

export type GraduationDraft = Omit<GraduationOrder, 'children' | 'additionalCopies'> & {
  children: number | ''
  additionalCopies: number | ''
}

export function isGraduationInstitution(value: unknown): value is GraduationInstitution {
  return typeof value === 'string' && Object.hasOwn(graduationInstitutions, value)
}

export function graduationCounts(children: unknown, additionalCopies: unknown, photography: unknown) {
  if (typeof children !== 'number' || !Number.isSafeInteger(children) || children < 1
    || typeof additionalCopies !== 'number' || !Number.isSafeInteger(additionalCopies) || additionalCopies < 0
    || !Number.isSafeInteger(children + additionalCopies)) return null
  return { children, additionalCopies, albums: children + additionalCopies, photos: photography === 'momento' ? children : 0 }
}

export function readGraduationOrder(config: Record<string, unknown>, { allowDisabled = false } = {}): GraduationOrder | null {
  const { orderType, institutionType, templateId, children, additionalCopies, photography, desiredDeliveryDate, preferredPhotographyDate } = config
  if (orderType !== GRADUATION_PHOTOBOOK_ORDER || !isGraduationInstitution(institutionType)) return null
  const template = findGraduationTemplate(templateId)
  if (!template?.institutions.includes(institutionType) || (!allowDisabled && !template.enabled)) return null
  const counts = graduationCounts(children, additionalCopies, photography)
  if (!counts || (photography !== 'momento' && photography !== 'provided')) return null
  if (desiredDeliveryDate !== undefined && !isDeliveryDate(desiredDeliveryDate)) return null
  if (preferredPhotographyDate !== undefined && (photography !== 'momento' || !isDeliveryDate(preferredPhotographyDate))) return null
  return {
    orderType, institutionType, templateId: template.id, children: counts.children, additionalCopies: counts.additionalCopies, photography,
    ...(desiredDeliveryDate === undefined ? {} : { desiredDeliveryDate }),
    ...(preferredPhotographyDate === undefined ? {} : { preferredPhotographyDate }),
  }
}

export function graduationOrderFromDraft(draft: GraduationDraft, { allowDisabled = false } = {}): GraduationOrder | null {
  return readGraduationOrder({
    ...draft,
    desiredDeliveryDate: draft.desiredDeliveryDate || undefined,
    preferredPhotographyDate: draft.preferredPhotographyDate || undefined,
  }, { allowDisabled })
}

export function graduationOrderDetails(order: GraduationOrder): string[] {
  const details = [
    `Учреждение: ${graduationInstitutions[order.institutionType]}`,
    `Шаблон: ${findGraduationTemplate(order.templateId)!.name}`,
    `Альбомы для детей: ${order.children}`,
    `Дополнительные альбомы: ${order.additionalCopies}`,
    `Всего альбомов: ${order.children + order.additionalCopies}`,
    `Фотографии: ${graduationPhotography[order.photography]}`,
    `Детей на фотосъёмке: ${order.photography === 'momento' ? order.children : 0}`,
  ]
  if (order.desiredDeliveryDate) details.push(photobookDeliveryDetail(order.desiredDeliveryDate))
  if (order.preferredPhotographyDate) {
    details.push(`Желаемая дата съёмки: ${order.preferredPhotographyDate.split('-').reverse().join('.')}`)
  }
  return details
}
