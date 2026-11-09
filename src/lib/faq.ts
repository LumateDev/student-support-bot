export type TopicId = 'login' | 'password' | 'materials'
export interface FaqTopic {
  id: TopicId
  label: string
  description: string
  question: string
  keywords: string[]
  answer: string
}
export const topics: FaqTopic[] = [
  {
    id: 'login',
    label: 'Вход в аккаунт',
    description: 'Как попасть на портал',
    question: 'Как авторизоваться?',
    keywords: ['войти', 'вход', 'логин', 'авториз', 'авторизац', 'входить'],
    answer:
      'Откройте страницу входа на учебный портал. Введите учебную почту и пароль, затем нажмите «Войти».\n\nЕсли войти не получается, проверьте раскладку клавиатуры и Caps Lock. Забыли пароль? Выберите тему «Восстановление пароля».',
  },
  {
    id: 'password',
    label: 'Восстановление пароля',
    description: 'Вернуть доступ к аккаунту',
    question: 'Как восстановить пароль?',
    keywords: ['парол', 'восстанов', 'сброс'],
    answer:
      'На странице входа нажмите «Забыли пароль». Укажите учебную почту и следуйте инструкции из письма.\n\nПисьмо не пришло? Проверьте папку «Спам» и правильность адреса. Если проблема остаётся, создайте обращение в поддержку.',
  },
  {
    id: 'materials',
    label: 'Учебные материалы',
    description: 'Найти лекции и конспекты',
    question: 'Где конспекты?',
    keywords: ['материал', 'лекци', 'курс', 'задани', 'конспект', 'учебник'],
    answer:
      'Откройте раздел «Мои курсы», выберите нужный курс и перейдите во вкладку «Материалы». Там находятся лекции, конспекты и задания.\n\nЕсли курса или материалов нет, уточните доступ у преподавателя или опишите ситуацию в форме обращения.',
  },
]
export function findFaq(question: string): FaqTopic | undefined {
  const normalized = question.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е')
  if (!normalized) return undefined
  // Вопрос о забытом пароле важнее общего упоминания входа.
  const priority: TopicId[] = ['password', 'login', 'materials']
  return priority
    .map((id) => topics.find((topic) => topic.id === id))
    .find((topic) => topic?.keywords.some((keyword) => normalized.includes(keyword)))
}
