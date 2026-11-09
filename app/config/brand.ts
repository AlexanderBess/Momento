/**
 * Brand and company data.
 *
 * The name MOMENTO is a working title: change `name` here and it updates
 * the logo, page titles, meta tags and footer.
 *
 * Contact, social and legal fields stay `null` / empty until real data exists.
 * Empty fields are simply not rendered — never put placeholder numbers here.
 */

export type SocialNetwork = 'telegram' | 'vk' | 'whatsapp' | 'instagram' | 'max'

export interface SocialLink {
  network: SocialNetwork
  label: string
  url: string
}

export interface BrandConfig {
  name: string
  tagline: string
  description: string
  region: string
  contacts: {
    phone: string | null
    email: string | null
    /** City-level location shown in the footer, e.g. "Новосибирск". */
    city: string | null
    workingHours: string | null
  }
  socials: SocialLink[]
  legal: {
    /** e.g. «ИП Иванов И. И.» */
    companyName: string | null
    inn: string | null
    ogrn: string | null
  }
}

export const brand: BrandConfig = {
  name: 'MOMENTO',
  tagline: 'Сохраняем главное',
  description:
    'Фотосъёмка, фотозоны, AI-фотобудка и фотокниги для частных и корпоративных событий в Новосибирске и области.',
  region: 'Новосибирск и Новосибирская область',
  contacts: {
    phone: null,
    email: null,
    city: null,
    workingHours: null,
  },
  socials: [],
  legal: {
    companyName: null,
    inn: null,
    ogrn: null,
  },
}
