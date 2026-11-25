import type { ImageAsset } from '#shared/imageAsset'

export const graduationInstitutions = {
  kindergarten: 'Детский сад',
  school: 'Школа',
} as const

export type GraduationInstitution = keyof typeof graduationInstitutions

export interface GraduationTemplate {
  id: string
  institutions: readonly GraduationInstitution[]
  name: string
  description: string
  cover: ImageAsset
  gallery?: readonly ImageAsset[]
  tags: readonly string[]
  featured: boolean
  enabled: boolean
  displayOrder: number
}

const coverPlaceholder = (name: string): ImageAsset => ({
  src: null,
  alt: `Пример обложки «${name}»`,
  width: 1600,
  height: 1200,
})

export const graduationTemplates: readonly GraduationTemplate[] = [
  {
    id: 'little-world', institutions: ['kindergarten'], name: 'Little World',
    description: 'Мягкие оттенки, крупные портреты и небольшие детали из жизни группы.',
    cover: coverPlaceholder('Little World'), tags: ['Мягкие оттенки'],
    featured: true, enabled: true, displayOrder: 10,
  },
  {
    id: 'happy-days', institutions: ['kindergarten'], name: 'Happy Days',
    description: 'Яркие акценты и коллажи для фотографий с игр, прогулок и праздников.',
    cover: coverPlaceholder('Happy Days'), tags: ['Коллаж'],
    featured: false, enabled: true, displayOrder: 20,
  },
  {
    id: 'little-stories', institutions: ['kindergarten'], name: 'Little Stories',
    description: 'Спокойное оформление с местом для коротких подписей и общих фотографий.',
    cover: coverPlaceholder('Little Stories'), tags: ['Подписи'],
    featured: false, enabled: true, displayOrder: 30,
  },
  {
    id: 'editorial', institutions: ['school'], name: 'Editorial',
    description: 'Журнальная композиция с крупными портретами, заголовками и фотографиями класса.',
    cover: coverPlaceholder('Editorial'), tags: ['Журнальный стиль'],
    featured: true, enabled: true, displayOrder: 10,
  },
  {
    id: 'minimal', institutions: ['school'], name: 'Minimal',
    description: 'Чистая сетка, широкие поля и спокойные акценты вокруг снимков.',
    cover: coverPlaceholder('Minimal'), tags: ['Минимализм'],
    featured: false, enabled: true, displayOrder: 20,
  },
  {
    id: 'creative', institutions: ['school'], name: 'Creative',
    description: 'Асимметричная композиция для портретов, групповых кадров и школьных деталей.',
    cover: coverPlaceholder('Creative'), tags: ['Асимметрия'],
    featured: false, enabled: true, displayOrder: 30,
  },
]

export function findGraduationTemplate(id: unknown): GraduationTemplate | undefined {
  return graduationTemplates.find((template) => template.id === id)
}

export function graduationTemplatesFor(institution: GraduationInstitution, savedTemplateId?: string): GraduationTemplate[] {
  return graduationTemplates
    .filter((template) => template.institutions.includes(institution) && (template.enabled || template.id === savedTemplateId))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder)
}
