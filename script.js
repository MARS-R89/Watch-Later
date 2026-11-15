const STORAGE_KEY = "watch-later-items";

const form = document.getElementById("item-form");
const topicInput = document.getElementById("topic");
const descInput = document.getElementById("description");
const linksContainer = document.getElementById("links-container");
const addLinkBtn = document.getElementById("add-link");
const itemsEl = document.getElementById("items");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");

let items = load();

/* ---------- storage ---------- */
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ---------- link inputs ---------- */
function addLinkRow(value = "") {
  const row = document.createElement("div");
  row.className = "link-row";

  const input = document.createElement("input");
  input.type = "url";
  input.className = "link-input";
  input.placeholder = "https://...";
  input.value = value;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-link";
  remove.textContent = "×";
  remove.title = "Remove link";
  remove.addEventListener("click", () => row.remove());

  row.append(input, remove);
  linksContainer.appendChild(row);
  input.focus();
}

addLinkBtn.addEventListener("click", () => addLinkRow());

function resetLinkRows() {
  linksContainer.innerHTML = "";
  const row = document.createElement("div");
  row.className = "link-row";
  row.innerHTML = '<input type="url" class="link-input" placeholder="https://...">';
  linksContainer.appendChild(row);
}

/* ---------- form submit ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const links = [...linksContainer.querySelectorAll(".link-input")]
    .map((i) => i.value.trim())
    .filter(Boolean);

  items.unshift({
    id: Date.now().toString(),
    topic: topicInput.value.trim(),
    links,
    description: descInput.value.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  });

  save();
  form.reset();
  resetLinkRows();
  render();
  topicInput.focus();
});

/* ---------- render ---------- */
function render() {
  const query = searchEl.value.trim().toLowerCase();

  const visible = items.filter((item) => {
    if (!query) return true;
    return (
      item.topic.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.links.some((l) => l.toLowerCase().includes(query))
    );
  });

  itemsEl.innerHTML = "";

  visible.forEach((item) => {
    const card = document.createElement("article");
    card.className = "item" + (item.done ? " done" : "");

    const title = document.createElement("h3");
    title.textContent = item.topic;
    card.appendChild(title);

    if (item.links.length) {
      const ul = document.createElement("ul");
      item.links.forEach((url) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = url;
        li.appendChild(a);
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }

    if (item.description) {
      const p = document.createElement("p");
      p.textContent = item.description;
      card.appendChild(p);
    }

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const doneBtn = document.createElement("button");
    doneBtn.textContent = item.done ? "Mark unwatched" : "Mark watched";
    doneBtn.addEventListener("click", () => {
      item.done = !item.done;
      save();
      render();
    });

    const delBtn = document.createElement("button");
    delBtn.className = "delete";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      if (!confirm("Delete this item?")) return;
      items = items.filter((i) => i.id !== item.id);
      save();
      render();
    });

    actions.append(doneBtn, delBtn);
    card.appendChild(actions);
    itemsEl.appendChild(card);
  });

  countEl.textContent = items.length ? `(${items.length})` : "";
  emptyEl.classList.toggle("hidden", visible.length > 0);
  emptyEl.textContent = items.length ? "No matches." : "Nothing saved yet.";
}

searchEl.addEventListener("input", render);

render();
