export interface TicketFields {
  name: string
  email: string
  problem: string
}
export type TicketErrors = Partial<Record<keyof TicketFields, string>>
export function normalizeTicket(fields: TicketFields): TicketFields {
  return { name: fields.name.trim(), email: fields.email.trim(), problem: fields.problem.trim() }
}
export function validateTicket(fields: TicketFields): TicketErrors {
  const value = normalizeTicket(fields)
  const errors: TicketErrors = {}
  if (!value.name) errors.name = 'Укажите, как к вам обращаться.'
  else if (value.name.length > 60) errors.name = 'Имя должно быть не длиннее 60 символов.'
  if (!value.email) errors.email = 'Укажите электронную почту.'
  else if (
    value.email.length > 100 ||
    !/^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(value.email)
  )
    errors.email = 'Введите адрес в формате student@example.ru.'
  if (!value.problem) errors.problem = 'Кратко опишите проблему.'
  else if (value.problem.length > 500)
    errors.problem = 'Описание должно быть не длиннее 500 символов.'
  return errors
}
