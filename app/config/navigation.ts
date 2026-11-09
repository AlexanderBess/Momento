import type { NavGroup, NavLink } from '~/types/navigation'
import { services } from './services'

export const mainNavigation: NavLink[] = [
  { label: 'Услуги', to: '/services' },
  { label: 'Портфолио', to: '/portfolio' },
  { label: 'О нас', to: '/about' },
  { label: 'FAQ', to: '/faq' },
]

export const primaryCta: NavLink = { label: 'Оставить заявку', to: '/order' }

export const cartLink: NavLink = { label: 'Корзина', to: '/checkout' }

export const footerNavigation: NavGroup[] = [
  {
    title: 'Услуги',
    links: services.map(({ title, href }) => ({ label: title, to: href })),
  },
  {
    title: 'Компания',
    links: [
      { label: 'Портфолио', to: '/portfolio' },
      { label: 'О нас', to: '/about' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Контакты', to: '/contacts' },
    ],
  },
]

export const legalLinks: NavLink[] = [{ label: 'Политика обработки персональных данных', to: '/privacy' }]
