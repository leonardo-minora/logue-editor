const shell = document.querySelector(".app-shell");
const divider = document.getElementById("divider");
const preview = document.getElementById("preview");
const searchInput = document.getElementById("search-input");
const toggleLeftButton = document.getElementById("toggle-left");
const toggleRightButton = document.getElementById("toggle-right");
const resetLayoutButton = document.getElementById("reset-layout");
const searchButton = document.getElementById("search-button");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const profileButton = document.getElementById("profile-button");
const playButton = document.getElementById("play-button");
const statusMessage = document.getElementById("status-message");

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

function setStatus(message) {
  statusMessage.textContent = message;
}

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
    setStatus("Digite um termo para pesquisar.");
    editor.focus();
    return;
  }

  const currentSelection = editor.getCursor("to");
  let cursor = editor.getSearchCursor(query, currentSelection, { caseFold: true });
  let wrapped = false;

  if (!cursor.findNext()) {
    cursor = editor.getSearchCursor(query, { line: 0, ch: 0 }, { caseFold: true });
    wrapped = true;
    if (!cursor.findNext()) {
      setStatus(`Nenhum resultado para "${query}".`);
      return;
    }
  }

  editor.setSelection(cursor.from(), cursor.to());
  editor.scrollIntoView({ from: cursor.from(), to: cursor.to() }, 80);
  editor.focus();
  setStatus(
    wrapped ? `Pesquisa reiniciada do início para "${query}".` : `Resultado encontrado para "${query}".`
  );
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
    event.preventDefault();
    setLeftPaneWidth(getCurrentPaneWidth() - 5);
    editor.refresh();
    setStatus("Largura do editor ajustada para a esquerda.");
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setLeftPaneWidth(getCurrentPaneWidth() + 5);
    editor.refresh();
    setStatus("Largura do editor ajustada para a direita.");
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
loginButton.addEventListener("click", () => setStatus("Fluxo de login reservado para a próxima etapa."));
logoutButton.addEventListener("click", () => setStatus("Fluxo de logout reservado para a próxima etapa."));
profileButton.addEventListener("click", () => setStatus("Área de perfil reservada para a próxima etapa."));
playButton.addEventListener("click", () => setStatus("Execução reservada para a próxima etapa."));

editor.on("change", renderPreview);

renderPreview();
resetLayout();
setStatus("Layout inicial carregado.");
