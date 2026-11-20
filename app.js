
// Чисті функції бізнес-логіки — не читають DOM і не змінюють стан сторінки.
function validateTaskTitle(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 80;
}

function isValidScreenState(state) {
  return ["loading", "content", "empty", "error"].includes(state);
}

// Обмежений набір функцій доступний файлу tests.js для ізольованих assertions.
window.TaskFlowUtils = Object.freeze({ validateTaskTitle, isValidScreenState });

const initialTasks = [
  { id: 1, title: "Підготувати практичну роботу №6", category: "Навчання", status: "У процесі", statusType: "warning", description: "Описати стани екрана та перевірити роботу інтерфейсу." },
  { id: 2, title: "Оновити дизайн портфоліо", category: "Особисте", status: "Заплановано", statusType: "neutral", description: "Переглянути структуру сторінок і компоненти." },
  { id: 3, title: "Перевірити JavaScript", category: "Навчання", status: "Виконано", statusType: "success", description: "Переконатися, що перемикання станів не створює помилок." },
  { id: 4, title: "Підготувати звіт", category: "Робота", status: "У процесі", statusType: "warning", description: "Зібрати результати та оформити висновки." }
];

let tasks = [...initialTasks];
let currentState = "loading";
let requestTimer = null;

const stateElements = [...document.querySelectorAll("[data-state]")];
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const resultCount = document.getElementById("resultCount");
const emptyTitle = document.getElementById("emptyTitle");
const emptyDescription = document.getElementById("emptyDescription");

function getFilteredTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase("uk");
  return tasks.filter(task =>
    `${task.title} ${task.category} ${task.description}`.toLocaleLowerCase("uk").includes(query)
  );
}

function renderTasks() {
  const visibleTasks = getFilteredTasks();
  taskList.replaceChildren();

  visibleTasks.forEach(task => {
    const card = document.createElement("article");
    card.className = "task-card";

    const top = document.createElement("div");
    top.className = "task-card-top";
    const category = document.createElement("span");
    category.className = "status-pill status-neutral";
    category.textContent = task.category;
    const status = document.createElement("span");
    status.className = `status-pill status-${task.statusType}`;
    status.textContent = task.status;
    top.append(category, status);

    const title = document.createElement("h3");
    title.textContent = task.title;
    const description = document.createElement("p");
    description.textContent = task.description;

    const footer = document.createElement("div");
    footer.className = "task-card-footer";
    const idText = document.createElement("span");
    idText.className = "muted";
    idText.textContent = `Завдання #${task.id}`;
    const remove = document.createElement("button");
    remove.className = "card-delete";
    remove.type = "button";
    remove.textContent = "Видалити";
    remove.setAttribute("aria-label", `Видалити завдання: ${task.title}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      updateContentOrEmpty();
    });

    footer.append(idText, remove);
    card.append(top, title, description, footer);
    taskList.append(card);
  });

  resultCount.textContent = `Показано ${visibleTasks.length} із ${tasks.length} завдань`;
  return visibleTasks.length;
}

function renderState(stateName) {
  const allowedStates = ["loading", "content", "empty", "error"];
  if (!isValidScreenState(stateName)) {
    console.warn(`Невідомий стан екрана: ${stateName}`);
    return;
  }

  currentState = stateName;
  stateElements.forEach(element => {
    element.classList.toggle("is-hidden", element.dataset.state !== stateName);
  });
  if (stateName === "content") renderTasks();
  if (stateName === "empty") resultCount.textContent = "Немає результатів для відображення";
  if (stateName === "loading") resultCount.textContent = "Завантаження даних…";
  if (stateName === "error") resultCount.textContent = "Помилка отримання даних";
}

function updateContentOrEmpty() {
  const count = renderTasks();
  if (count > 0) {
    renderState("content");
  } else {
    const hasQuery = searchInput.value.trim().length > 0;
    emptyTitle.textContent = hasQuery ? "Нічого не знайдено" : "Список завдань порожній";
    emptyDescription.textContent = hasQuery
      ? "Спробуйте змінити пошуковий запит або скиньте фільтр."
      : "Усі завдання видалено. Ви можете відновити початковий список.";
    document.getElementById("emptyAction").textContent = hasQuery ? "Скинути фільтр" : "Відновити список";
    renderState("empty");
  }
}

function simulateRequest({ fail = false } = {}) {
  if (requestTimer) window.clearTimeout(requestTimer);
  renderState("loading");
  requestTimer = window.setTimeout(() => {
    requestTimer = null;
    if (fail) {
      renderState("error");
    } else {
      updateContentOrEmpty();
    }
  }, 1700);
}

document.querySelectorAll("[data-show-state]").forEach(button => {
  button.addEventListener("click", () => {
    if (requestTimer) {
      window.clearTimeout(requestTimer);
      requestTimer = null;
    }
    const state = button.dataset.showState;
    if (state === "content") updateContentOrEmpty();
    else renderState(state);
  });
});

document.getElementById("refreshButton").addEventListener("click", () => simulateRequest());
document.getElementById("retryButton").addEventListener("click", () => simulateRequest());
searchInput.addEventListener("input", updateContentOrEmpty);

document.getElementById("clearButton").addEventListener("click", () => {
  tasks = [];
  searchInput.value = "";
  updateContentOrEmpty();
});

document.getElementById("emptyAction").addEventListener("click", () => {
  if (searchInput.value.trim()) {
    searchInput.value = "";
  } else {
    tasks = [...initialTasks];
  }
  updateContentOrEmpty();
});

const dialog = document.getElementById("taskDialog");
const taskForm = document.getElementById("taskForm");
document.getElementById("addTask").addEventListener("click", () => {
  taskForm.reset();
  dialog.showModal();
  document.getElementById("taskTitle").focus();
});
document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
document.getElementById("cancelDialog").addEventListener("click", () => dialog.close());

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  const category = document.getElementById("taskCategory").value;
  if (!validateTaskTitle(title)) return;
  tasks.unshift({
    id: Date.now(),
    title,
    category,
    status: "Заплановано",
    statusType: "neutral",
    description: "Нове завдання, додане користувачем."
  });
  dialog.close();
  searchInput.value = "";
  updateContentOrEmpty();
});

document.getElementById("themeToggle").addEventListener("click", event => {
  const isDark = document.documentElement.dataset.theme === "dark";
  if (isDark) {
    delete document.documentElement.dataset.theme;
    event.currentTarget.textContent = "Темна тема";
  } else {
    document.documentElement.dataset.theme = "dark";
    event.currentTarget.textContent = "Світла тема";
  }
});

renderState("loading");
window.setTimeout(() => updateContentOrEmpty(), 900);
