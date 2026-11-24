import type { NavGroup, NavItem, NavLink } from '~/types/navigation'
import { services } from './services'

/** Service pages for the header dropdown — same routes and copy as the services catalogue. */
export const servicesNavigation: NavLink[] = services.map(({ title, summary, href }) => ({
  label: title,
  to: href,
  description: summary,
}))

// Portfolio, FAQ and Contacts remain available by direct URL until their content is ready.
// For an item with `children`, `to` is only the section's path prefix (marks the trigger as current);
// there is no /services index page.
export const mainNavigation: NavItem[] = [
  { label: 'Услуги', to: '/services', children: servicesNavigation },
  { label: 'О нас', to: '/about' },
]

/** Opens the shared request form; with an empty selection it suggests the services first. */
export const primaryCta: NavLink = { label: 'К заявке', to: '/checkout' }

/** The header indicator opens the selection drawer; `to` is the full request form. */
export const cartLink: NavLink = { label: 'Моя подборка', to: '/checkout' }

export const footerNavigation: NavGroup[] = [
  {
    title: 'Услуги',
    links: services.map(({ title, href }) => ({ label: title, to: href })),
  },
  {
    title: 'Компания',
    links: [{ label: 'О нас', to: '/about' }],
  },
]

export const legalLinks: NavLink[] = [{ label: 'Политика обработки персональных данных', to: '/privacy' }]
