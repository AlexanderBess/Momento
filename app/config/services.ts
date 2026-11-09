import type { Service, ServiceSlug } from '~/types/service'

/**
 * Service catalogue. Images are `null` until real photos are added
 * to /public/images/services (see docs/IMAGES.md) — a clearly marked
 * placeholder is rendered instead.
 */
export const services: Service[] = [
  {
    slug: 'booth',
    title: 'AI-фотобудка',
    summary: 'Современные технологии для незабываемых фото',
    href: '/services/booth',
    featured: true,
    image: { src: null, alt: 'AI-фотобудка на мероприятии', width: 1200, height: 1500 },
  },
  {
    slug: 'photography',
    title: 'Фотосъёмка',
    summary: 'Профессиональные кадры вашего события',
    href: '/services/photography',
    image: { src: null, alt: 'Фотограф снимает праздничное событие', width: 1200, height: 1500 },
  },
  {
    slug: 'photozones',
    title: 'Фотозоны',
    summary: 'Стильные декорации для любого формата',
    href: '/services/photozones',
    image: { src: null, alt: 'Оформленная фотозона с декором', width: 1200, height: 1500 },
  },
  {
    slug: 'photobooks',
    title: 'Фотокниги',
    summary: 'Память, которую хочется листать',
    href: '/services/photobooks',
    image: { src: null, alt: 'Раскрытая печатная фотокнига', width: 1200, height: 1500 },
  },
]

export function findService(slug: string): Service | undefined {
  return services.find((service) => service.slug === (slug as ServiceSlug))
}
