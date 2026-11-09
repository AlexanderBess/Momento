export type BenefitIcon = 'speed' | 'premium' | 'personal' | 'team'

export interface Benefit {
  icon: BenefitIcon
  title: string
  text: string
}

/**
 * Qualitative benefits only — no numbers, ratings or guarantees
 * until they are backed by real experience.
 */
export const benefits: Benefit[] = [
  {
    icon: 'speed',
    title: 'Быстро и удобно',
    text: 'Оставьте заявку — мы свяжемся, уточним детали и предложим подходящий формат.',
  },
  {
    icon: 'premium',
    title: 'Премиальный сервис',
    text: 'Аккуратное оборудование, продуманный декор и внимание к деталям на каждом этапе.',
  },
  {
    icon: 'personal',
    title: 'Индивидуальный подход',
    text: 'Подбираем услуги и оформление под формат события, площадку и настроение.',
  },
  {
    icon: 'team',
    title: 'Профессиональная команда',
    text: 'Семейная команда, которая любит фотографию и бережно относится к вашим моментам.',
  },
]
