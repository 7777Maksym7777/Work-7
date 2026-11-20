/*
 * Практична робота №7 — нативні модульні перевірки.
 * Файл ізольований від UI: assertions не змінюють DOM, тему чи дані.
 */
function runUnitTests() {
  const { validateTaskTitle, isValidScreenState } = window.TaskFlowUtils;

  console.assert(
    validateTaskTitle("Підготувати звіт") === true,
    "FAIL: коректна назва завдання повинна проходити валідацію."
  );

  console.assert(
    validateTaskTitle("") === false,
    "FAIL: порожній рядок не повинен проходити валідацію."
  );

  console.assert(
    validateTaskTitle("     ") === false,
    "FAIL: рядок лише з пробілів не повинен проходити валідацію."
  );

  console.assert(
    validateTaskTitle("A".repeat(81)) === false,
    "FAIL: назва довша за 80 символів не повинна проходити валідацію."
  );

  console.assert(
    validateTaskTitle(123) === false,
    "FAIL: значення не-рядкового типу не повинно проходити валідацію."
  );

  console.assert(
    isValidScreenState("content") === true &&
    isValidScreenState("unknown") === false,
    "FAIL: перевірка допустимих станів екрана працює некоректно."
  );

  console.info("TaskFlow: модульні перевірки завершено. Якщо немає Assertion failed — усі тести пройшли.");
}

window.addEventListener("DOMContentLoaded", runUnitTests, { once: true });
