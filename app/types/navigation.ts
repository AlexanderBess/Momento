export interface NavLink {
  label: string
  to: string
  /** Short helper line, shown e.g. under service names in the header dropdown. */
  description?: string
}

/** A header item: a plain link, or a section whose `children` open in a dropdown. */
export interface NavItem extends NavLink {
  children?: NavLink[]
}

export interface NavGroup {
  title: string
  links: NavLink[]
}
