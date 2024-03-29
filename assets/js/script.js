// inicia o app
document.addEventListener("DOMContentLoaded", initialize);

// variaveis globais
const todoTitleElement = document.querySelector("#todo-title");
const todoListElement = document.querySelector("#todo-list");
const btnCompletedTask = document.querySelector("#btn-completed-task");
const completedTodoListElement = document.querySelector("#completed-task");

// array temporario para salvar e buscar tarefas completadas
let completedTodoListTemp = [];

function initialize() {
  getTodoList();
  getTodoTitle();

  document.querySelector("#btn-add-task").addEventListener("click", createTask);
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") createTask();
  });
  todoTitleElement.addEventListener("input", setTodoTitle);
}

const icons = {
  xMark: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
  </svg>`,
  draggable: `<svg fill="currentColor" width="16" height="16" version="1.1" id="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64px" height="64px" viewBox="0 0 32 32" xml:space="preserve" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:none;} </style> <title>draggable</title> <rect x="10" y="6" width="4" height="4"></rect> <rect x="18" y="6" width="4" height="4"></rect> <rect x="10" y="14" width="4" height="4"></rect> <rect x="18" y="14" width="4" height="4"></rect> <rect x="10" y="22" width="4" height="4"></rect> <rect x="18" y="22" width="4" height="4"></rect> <rect id="_Transparent_Rectangle_" class="st0" width="32" height="32"></rect> </g></svg>`,
};

// cria um botão com um icone
function createButton(className, icon) {
  const btn = document.createElement("button");

  btn.type = "button";
  btn.classList.add("btn-pill");
  btn.classList.add(className);
  btn.innerHTML = icon;

  return btn;
}

// cria um elemento
function createElement(element, className) {
  const el = document.createElement(element);
  el.classList.add(className);

  return el;
}

// cria checkbox
function createCheckInput() {
  const input = document.createElement("input");
  input.classList.add("form-check-input");
  input.type = "checkbox";

  return input;
}

// cria conteudo editavel
function createTextContent(
  className,
  contentEditable,
  spellcheck,
  ariaMultiline
) {
  const span = document.createElement("span");
  span.setAttribute("contenteditable", contentEditable);
  span.setAttribute("spellcheck", spellcheck);
  span.setAttribute("aria-multiline", ariaMultiline);
  span.classList.add(className);

  return span;
}

// cria uma tarefa
function createTask(task) {
  const listItem = createElement("li", "list-item");
  todoListElement.appendChild(listItem);

  listItem.addEventListener("dragstart", () => listItem.classList.add("ghost"));
  listItem.addEventListener("dragend", () =>
    listItem.classList.remove("ghost")
  );

  todoListElement.addEventListener("dragover", (e) => {
    const dragging = document.querySelector(".ghost");
    const applyAfter = getNewPosition(e.clientY);

    if (applyAfter) {
      applyAfter.insertAdjacentElement("afterend", dragging);
    } else {
      todoListElement.prepend(dragging);
    }

    setTodoList();
  });

  const wrapper = createElement("div", "form-control");
  listItem.appendChild(wrapper);

  const btnMoveTask = createButton("btn-move", icons.draggable);
  wrapper.appendChild(btnMoveTask);

  btnMoveTask.addEventListener("mouseover", () => (listItem.draggable = true));
  btnMoveTask.addEventListener("mouseout", () => (listItem.draggable = false));

  const checkboxElement = createCheckInput();
  wrapper.appendChild(checkboxElement);

  checkboxElement.addEventListener("change", () => {
    completedTodoListTemp.push(taskText.textContent);
    listItem.remove();
    setTodoList();
    setCompletedTodoList();
  });

  const taskText = createTextContent("taskText", true, true, true);
  wrapper.appendChild(taskText);
  taskText.focus();

  if (typeof task === "string") {
    taskText.textContent = task;
    taskText.blur();
  }

  taskText.addEventListener("input", setTodoList);

  const btnRemoveTask = createButton("btn-remove", icons.xMark);
  listItem.appendChild(btnRemoveTask);

  btnRemoveTask.addEventListener("click", () => {
    listItem.remove();
    setTodoList();
  });

  setTodoList();
}

// busca posição do item
function getNewPosition(posY) {
  const items = document.querySelectorAll("li:not(.ghost)");
  let result;

  items.forEach((item) => {
    const box = item.getBoundingClientRect();
    const boxCenterY = box.y + box.height / 2;

    if (boxCenterY <= posY) result = item;
  });

  return result;
}

// cria uma tarefa concluida
function createCompletedTask(task) {
  const listItem = createElement("li", "list-item");
  completedTodoListElement.appendChild(listItem);

  const wrapper = createElement("div", "form-control");
  listItem.appendChild(wrapper);

  const checkboxElement = createCheckInput();
  wrapper.appendChild(checkboxElement);

  checkboxElement.addEventListener("change", () => {
    createTask(taskText.textContent);
    listItem.remove();
    handleRemoveCompletedTask();
  });

  const taskText = createTextContent("completedTaskText", false, false, false);
  wrapper.appendChild(taskText);

  if (typeof task === "string") {
    taskText.textContent = task;
    checkboxElement.checked = true;
  }

  const btnRemoveTask = createButton("btn-remove", icons.xMark, "pointer");
  listItem.appendChild(btnRemoveTask);

  btnRemoveTask.addEventListener("click", () => {
    listItem.remove();
    handleRemoveCompletedTask();
  });

  btnCompletedTask.addEventListener("click", toggleDisplay);
}

// salva lista de to-do no localstorage
function setTodoList() {
  let tasks = document.querySelectorAll(".taskText");
  let todoList = [];

  tasks.forEach((el) => todoList.push(el.textContent));

  localStorage.setItem("taskList", JSON.stringify(todoList));
}

// salva titulo do to-do no localstorage
function setTodoTitle() {
  let title = todoTitleElement.textContent.trim();
  localStorage.setItem("todoTitle", JSON.stringify(title));
}

// busca titulo do todo
function getTodoTitle() {
  let title = JSON.parse(localStorage.getItem("todoTitle"));
  if (title) todoTitleElement.textContent = title;
}

// busca to-do e titulo no localstorage
function getTodoList() {
  let todoList = JSON.parse(localStorage.getItem("taskList"));

  if (todoList)
    todoList.forEach((tasks) => {
      createTask(tasks);
    });

  getCompletedTodoList();
}

// salva as tarefas concluidas no localstorage
function setCompletedTodoList() {
  localStorage.setItem(
    "completedTodoList",
    JSON.stringify(completedTodoListTemp)
  );

  getCompletedTodoList();
}

// busca as tarefas completadas
function getCompletedTodoList() {
  completedTodoListTemp = [];

  let completedTodoList = JSON.parse(localStorage.getItem("completedTodoList"));

  if (completedTodoList) {
    completedTodoListTemp = [...completedTodoList];
    completedTodoListElement.innerHTML = "";
    completedTodoListTemp.forEach((task) => createCompletedTask(task));
  }

  showElement();
}

// mostra ou oculta butão de tarefas concluidas
function showElement() {
  btnCompletedTask.style.display =
    completedTodoListTemp.length > 0 ? "flex" : "none";

  countCompletedTask();
}

// exibe a quantidade de tarefas concluidas
function countCompletedTask() {
  let completedTaskElement = document.querySelector("#count-completed-tasks");
  let completedTaskText = document.querySelector("#completed-task-text");

  completedTaskElement.textContent = completedTodoListTemp.length;
  completedTaskText.textContent =
    completedTodoListTemp.length <= 1 ? "item concluído" : "itens concluídos";
}

// alterna entre display none e flex
function toggleDisplay() {
  let icon = btnCompletedTask.querySelector("svg");
  icon.classList.add("transition");

  if (completedTodoListElement.style.display !== "none") {
    completedTodoListElement.style.display = "none";
    icon.style.transform = "rotate(-90deg)";
  } else {
    completedTodoListElement.style.display = "flex";
    icon.style.transform = "rotate(0deg)";
  }
}

// lida com o evento de remover a tarefa concluida
function handleRemoveCompletedTask() {
  completedTodoListTemp = [];
  let newCompletedTodoList = document.querySelectorAll(".completedTaskText");
  newCompletedTodoList.forEach((el) =>
    completedTodoListTemp.push(el.textContent)
  );

  setCompletedTodoList();
}
