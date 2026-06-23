const shell = document.querySelector(".app-shell");
const divider = document.getElementById("divider");
const preview = document.getElementById("preview");
const searchInput = document.getElementById("search-input");
const toggleLeftButton = document.getElementById("toggle-left");
const toggleRightButton = document.getElementById("toggle-right");
const resetLayoutButton = document.getElementById("reset-layout");
const searchButton = document.getElementById("search-button");

const initialDocument = `# Bem-vindo ao Logue

Este é um projeto inicial em **Electron** com:

- Header com ações principais
- Editor baseado em CodeMirror
- Visualizador de texto com Marked
- Painéis redimensionáveis e ocultáveis

## Exemplo

\`\`\`javascript
function saudacao(nome) {
  return \`Olá, \${nome}!\`;
}
\`\`\`
`;

const editor = CodeMirror(document.getElementById("editor"), {
  value: initialDocument,
  mode: "markdown",
  theme: "material-darker",
  lineNumbers: true,
  lineWrapping: true,
  tabSize: 2,
});

marked.setOptions({
  breaks: true,
  gfm: true,
});

function renderPreview() {
  preview.innerHTML = marked.parse(editor.getValue());
}

function setLeftPaneWidth(percentage) {
  const bounded = Math.max(20, Math.min(80, percentage));
  shell.style.setProperty("--left-pane-width", `${bounded}%`);
}

function getCurrentPaneWidth() {
  return parseFloat(getComputedStyle(shell).getPropertyValue("--left-pane-width"));
}

function clearHiddenLayouts() {
  shell.classList.remove("layout-left-hidden", "layout-right-hidden");
  updateLayoutControls();
}

function updateLayoutControls() {
  const leftHidden = shell.classList.contains("layout-left-hidden");
  const rightHidden = shell.classList.contains("layout-right-hidden");
  divider.hidden = leftHidden || rightHidden;
  toggleLeftButton.textContent = leftHidden ? "Mostrar editor" : "Ocultar editor";
  toggleRightButton.textContent = rightHidden ? "Mostrar visualizador" : "Ocultar visualizador";
}

function togglePane(side) {
  const targetClass = side === "left" ? "layout-left-hidden" : "layout-right-hidden";
  const oppositeClass = side === "left" ? "layout-right-hidden" : "layout-left-hidden";
  const isHidden = shell.classList.contains(targetClass);

  if (isHidden) {
    shell.classList.remove(targetClass);
  } else {
    shell.classList.remove(oppositeClass);
    shell.classList.add(targetClass);
  }

  updateLayoutControls();
  editor.refresh();
}

function resetLayout() {
  clearHiddenLayouts();
  setLeftPaneWidth(50);
  editor.refresh();
}

function searchInEditor() {
  const query = searchInput.value.trim();

  if (!query) {
    editor.focus();
    return;
  }

  const currentSelection = editor.getCursor("to");
  let cursor = editor.getSearchCursor(query, currentSelection, { caseFold: true });

  if (!cursor.findNext()) {
    cursor = editor.getSearchCursor(query, { line: 0, ch: 0 }, { caseFold: true });
    if (!cursor.findNext()) {
      return;
    }
  }

  editor.setSelection(cursor.from(), cursor.to());
  editor.scrollIntoView({ from: cursor.from(), to: cursor.to() }, 80);
  editor.focus();
}

let isDragging = false;

divider.addEventListener("mousedown", () => {
  clearHiddenLayouts();
  isDragging = true;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

window.addEventListener("mousemove", (event) => {
  if (!isDragging) {
    return;
  }

  const bounds = shell.getBoundingClientRect();
  const nextWidth = ((event.clientX - bounds.left) / bounds.width) * 100;
  setLeftPaneWidth(nextWidth);
  editor.refresh();
});

divider.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    setLeftPaneWidth(getCurrentPaneWidth() - 5);
    editor.refresh();
  }

  if (event.key === "ArrowRight") {
    setLeftPaneWidth(getCurrentPaneWidth() + 5);
    editor.refresh();
  }
});

toggleLeftButton.addEventListener("click", () => togglePane("left"));
toggleRightButton.addEventListener("click", () => togglePane("right"));
resetLayoutButton.addEventListener("click", resetLayout);
searchButton.addEventListener("click", searchInEditor);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchInEditor();
  }
});

editor.on("change", renderPreview);

renderPreview();
resetLayout();
