/**
 * Shared vocabulary of the request flow.
 *
 * Every service adds its positions to «Моя подборка» (useCart / useSelection); one request form at
 * /checkout sends the whole selection with one manual confirmation — a date is never shown as
 * booked before that. Event details belong to the whole request, not to positions.
 */

export type EventType = 'wedding' | 'birthday' | 'private' | 'corporate' | 'brand'

export const eventTypeLabels: Record<EventType, string> = {
  wedding: 'Свадьба',
  birthday: 'День рождения',
  private: 'Частное мероприятие',
  corporate: 'Корпоративное мероприятие',
  brand: 'Бренд-мероприятие',
}

export const eventTypes = Object.keys(eventTypeLabels) as EventType[]
