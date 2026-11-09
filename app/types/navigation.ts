export interface NavLink {
  label: string
  to: string
}

export interface NavGroup {
  title: string
  links: NavLink[]
}
