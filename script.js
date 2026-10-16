
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const remainingCount = document.getElementById("remaining-count");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");
const savedStatus = document.getElementById("saved-status");

const STORAGE_KEY = "taskflow-tasks";
let currentFilter = "all";
let tasks = [];

try {
  const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  }
} catch (error) {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    savedStatus.textContent = "● Tasks saved locally";
  } catch (error) {
    savedStatus.textContent = "Unable to save tasks in this browser";
  }
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";
    if (task.completed) item.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(existingTask => existingTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  emptyMessage.hidden = visibleTasks.length > 0;

  if (visibleTasks.length === 0) {
    emptyMessage.textContent = tasks.length === 0
      ? "No tasks yet. Add your first task above!"
      : `No ${currentFilter} tasks to show.`;
  }

  const completed = tasks.filter(task => task.completed).length;
  const remaining = tasks.length - completed;
  const percentage = tasks.length === 0
    ? 0
    : Math.round((completed / tasks.length) * 100);

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = remaining;
  progressText.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", "100");
  progressBar.setAttribute("aria-valuenow", String(percentage));
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false
  });

  currentFilter = "all";
  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });

  saveTasks();
  renderTasks();

  taskForm.reset();
  taskInput.focus();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(filterButton => {
      filterButton.classList.toggle("active", filterButton === button);
    });

    renderTasks();
  });
});

document.getElementById("clear-completed").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

document.getElementById("year").textContent = new Date().getFullYear();

renderTasks();
