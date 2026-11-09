import { test } from "node:test";
import assert from "node:assert/strict";
import { findFaq, topics } from "../src/lib/faq.ts";
import { normalizeTicket, validateTicket } from "../src/lib/ticket.ts";
import { resolveTheme } from "../src/composables/useTheme.ts";

test("Тема: явный выбор приоритетнее системной настройки", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});
test("Тема: без сохранённого выбора используется системная настройка", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme("unknown", true), "dark");
});

const examples = [
  ["Как авторизоваться?", "login"],
  ["  КАК АВТОРИЗОВАТЬСЯ?  ", "login"],
  ["Не могу войти", "login"],
  ["Где конспекты?", "materials"],
  ["Где лекции курса?", "materials"],
  ["Как открыть материалы?", "materials"],
  ["Как восстановить пароль?", "password"],
  ["Не могу войти, забыл пароль", "password"],
  ["Мне нужен оператор", undefined],
  ["  ", undefined],
];
for (const [question, expected] of examples) {
  test(`FAQ: ${JSON.stringify(question)} → ${expected ?? "нет ответа"}`, () => {
    assert.equal(findFaq(question)?.id, expected);
  });
}
test("Для каждой темы есть ответ и рабочий пример вопроса", () => {
  assert.equal(new Set(topics.map((topic) => topic.id)).size, 3);
  for (const topic of topics) {
    assert.ok(topic.answer.trim());
    assert.equal(findFaq(topic.question)?.id, topic.id);
  }
});
test("Форма: все пустые поля отклоняются", () => {
  assert.deepEqual(Object.keys(validateTicket({ name: "", email: "", problem: "" })).sort(), [
    "email",
    "name",
    "problem",
  ]);
});
test("Форма: пробелы и переводы строк не считаются содержимым", () => {
  assert.equal(
    Object.keys(validateTicket({ name: "   ", email: "\t", problem: " \n " })).length,
    3,
  );
});
test("Форма: неверные адреса не принимаются", () => {
  for (const email of [
    "wrong",
    "student@",
    "@example.ru",
    "student@example",
    "a b@example.ru",
    "a@@example.ru",
    "a..b@example.ru",
  ]) {
    assert.ok(validateTicket({ name: "Студент", email, problem: "Нет курса" }).email, email);
  }
});
test("Форма: корректные данные принимаются и нормализуются", () => {
  const values = {
    name: "  Александр ",
    email: " student+test@example.ru ",
    problem: " Не вижу конспекты.\nНужен доступ. ",
  };
  assert.deepEqual(validateTicket(values), {});
  assert.deepEqual(normalizeTicket(values), {
    name: "Александр",
    email: "student+test@example.ru",
    problem: "Не вижу конспекты.\nНужен доступ.",
  });
});
test("Форма: превышение лимитов не принимается", () => {
  assert.equal(
    Object.keys(
      validateTicket({
        name: "я".repeat(61),
        email: `${"a".repeat(100)}@example.ru`,
        problem: "x".repeat(501),
      }),
    ).length,
    3,
  );
});
