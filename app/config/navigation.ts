import type { NavGroup, NavItem, NavLink } from '~/types/navigation'
import { services } from './services'

/** Service pages for the header dropdown — same routes and copy as the services catalogue. */
export const servicesNavigation: NavLink[] = services.map(({ title, summary, href }) => ({
  label: title,
  to: href,
  description: summary,
}))

// «Портфолио» is intentionally not in the header until there is enough material;
// the page itself (/portfolio) and its footer link stay.
// For an item with `children`, `to` is only the section's path prefix (marks the trigger as current);
// there is no /services index page.
export const mainNavigation: NavItem[] = [
  { label: 'Услуги', to: '/services', children: servicesNavigation },
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
