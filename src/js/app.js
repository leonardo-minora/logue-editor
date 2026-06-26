// ============================================================
// Logue Editor — app.js
// Lógica do editor Python + Visualizador Markdown
// ============================================================

// --- Inicialização do CodeMirror (Editor Python) ---

const pythonEditor = CodeMirror.fromTextArea(
  document.getElementById("python-editor"),
  {
    mode: "python",
    theme: "monokai",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: false,
    extraKeys: {
      Tab: (cm) => cm.execCommand("indentMore"),
      "Shift-Tab": (cm) => cm.execCommand("indentLess"),
    },
  },
);

// Código Python de exemplo para novos alunos
const PYTHON_INICIAL = `# Bem-vindo ao Logue Editor!
# Disciplina: Introdução à Lógica e Programação
# ---------------------------------------------------

def saudacao(nome):
    """Exibe uma saudação personalizada."""
    print(f"Olá, {nome}! Bem-vindo à programação!")


# Chamando a função
saudacao("Estudante")


# ---- Calculadora simples ----

def calcular(a, b, operacao):
    """Realiza uma operação matemática básica."""
    if operacao == "+":
        return a + b
    elif operacao == "-":
        return a - b
    elif operacao == "*":
        return a * b
    elif operacao == "/" and b != 0:
        return a / b
    else:
        return "Operação inválida ou divisão por zero"


print(calcular(10, 5, "+"))   # 15
print(calcular(10, 5, "*"))   # 50
print(calcular(10, 0, "/"))   # Operação inválida ou divisão por zero


# ---- Estruturas de controle ----

notas = [7.5, 8.0, 6.5, 9.0, 5.0]

for nota in notas:
    if nota >= 7:
        situacao = "Aprovado"
    elif nota >= 5:
        situacao = "Recuperação"
    else:
        situacao = "Reprovado"
    print(f"Nota {nota:.1f} → {situacao}")
`;

pythonEditor.setValue(PYTHON_INICIAL);

// --- Configuração do marked.js ---

marked.setOptions({ breaks: true, gfm: true });

// --- Elementos do DOM ---

const markdownSource = document.getElementById("markdown-source");
const markdownPreview = document.getElementById("markdown-preview");
const tabSource = document.getElementById("tab-source");
const tabPreview = document.getElementById("tab-preview");

// Conteúdo Markdown de boas-vindas
const MARKDOWN_INICIAL = `# Logue Editor

## Bem-vindo! 🎓

O **Logue Editor** é uma ferramenta de apoio à disciplina de
*Introdução à Lógica e Programação*.

---

## Painéis

| Painel | Conteúdo |
|--------|----------|
| ◀ Esquerdo | Visualizador de Markdown |
| ▶ Direito | Editor de código Python |

## Como usar

1. Escreva seu código **Python** no painel direito
2. Documente seu raciocínio em **Markdown** neste painel
3. Clique em **Prévia** para ver o texto formatado
4. Use **Salvar** para baixar o arquivo \`.py\`
5. Arraste a barra central para redimensionar os painéis

## Exemplo de código

\`\`\`python
def hello_world():
    print("Hello, World!")

hello_world()
\`\`\`

## Estruturas básicas do Python

### Variáveis e tipos
\`\`\`python
nome    = "Python"    # str
versao  = 3.11        # float
ativo   = True        # bool
\`\`\`

### Condicionais
\`\`\`python
if nota >= 7:
    print("Aprovado!")
elif nota >= 5:
    print("Recuperação")
else:
    print("Reprovado")
\`\`\`

### Laços
\`\`\`python
for i in range(5):
    print(f"Iteração {i}")
\`\`\`

---

> 💡 **Dica:** A barra entre os painéis pode ser arrastada
> para ajustar o espaço de cada área.
`;

markdownSource.value = MARKDOWN_INICIAL;

// --- Renderização do Markdown ---

function updatePreview() {
  markdownPreview.innerHTML = marked.parse(markdownSource.value);
}

// Atualiza a prévia em tempo real ao digitar
markdownSource.addEventListener("input", updatePreview);

// Renderiza o conteúdo inicial
updatePreview();

// --- Troca de abas (Fonte / Prévia) ---

tabSource.addEventListener("click", () => {
  tabSource.classList.add("active");
  tabSource.setAttribute("aria-selected", "true");
  tabPreview.classList.remove("active");
  tabPreview.setAttribute("aria-selected", "false");
  markdownSource.classList.remove("hidden");
  markdownPreview.classList.add("hidden");
});

tabPreview.addEventListener("click", () => {
  tabPreview.classList.add("active");
  tabPreview.setAttribute("aria-selected", "true");
  tabSource.classList.remove("active");
  tabSource.setAttribute("aria-selected", "false");
  markdownPreview.classList.remove("hidden");
  markdownSource.classList.add("hidden");
  updatePreview();
});

// --- Redimensionador de painéis ---

const resizer = document.getElementById("resizer");
const leftPanel = document.getElementById("panel-markdown");
const rightPanel = document.getElementById("panel-editor");
const appBody = document.querySelector(".app-body");

let isResizing = false;

resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  resizer.classList.add("resizing");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;

  const bodyRect = appBody.getBoundingClientRect();
  const resizerWidth = 4;
  const availableWidth = bodyRect.width - resizerWidth;
  const newLeftPx = e.clientX - bodyRect.left;
  const leftPct = Math.min(80, Math.max(20, (newLeftPx / availableWidth) * 100));

  leftPanel.style.flex = `0 0 ${leftPct}%`;
  rightPanel.style.flex = `0 0 ${100 - leftPct}%`;

  // Força o CodeMirror a recalcular seu layout
  pythonEditor.refresh();
});

document.addEventListener("mouseup", () => {
  if (!isResizing) return;
  isResizing = false;
  resizer.classList.remove("resizing");
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  pythonEditor.refresh();
});

// --- Posição do cursor no editor Python ---

pythonEditor.on("cursorActivity", () => {
  const cursor = pythonEditor.getCursor();
  document.getElementById("cursor-pos").textContent =
    `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
});

// --- Botão: Novo arquivo ---

document.getElementById("btn-new").addEventListener("click", () => {
  const temConteudo = pythonEditor.getValue().trim() !== "";
  if (!temConteudo || confirm("Criar novo arquivo? As alterações não salvas serão perdidas.")) {
    pythonEditor.setValue("# Novo arquivo Python\n\n");
    document.getElementById("filename").value = "novo.py";
    pythonEditor.focus();
    pythonEditor.setCursor({ line: 2, ch: 0 });
  }
});

// --- Botão: Abrir arquivo ---

document.getElementById("btn-open").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".py,.txt";

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      pythonEditor.setValue(ev.target.result);
      document.getElementById("filename").value = file.name;
      pythonEditor.focus();
    };
    reader.readAsText(file, "utf-8");
  });

  input.click();
});

// --- Botão: Salvar arquivo ---

document.getElementById("btn-save").addEventListener("click", () => {
  const code = pythonEditor.getValue();
  const filename = document.getElementById("filename").value.trim() || "script.py";

  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
});

// --- Botão: Executar código ---

document.getElementById("btn-run").addEventListener("click", () => {
  // Placeholder — em versões futuras integrará com Pyodide ou backend Deno
  const code = pythonEditor.getValue();
  console.info("[Logue Editor] Código Python submetido:\n", code);
  alert(
    "⚠️  Execução de Python ainda não disponível nesta versão.\n\n" +
    "O código foi registrado no console (F12 → Console).",
  );
});

// --- Atalhos de teclado globais ---

document.addEventListener("keydown", (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;

  switch (e.key.toLowerCase()) {
    case "s":
      e.preventDefault();
      document.getElementById("btn-save").click();
      break;
    case "o":
      e.preventDefault();
      document.getElementById("btn-open").click();
      break;
    case "n":
      e.preventDefault();
      document.getElementById("btn-new").click();
      break;
  }
});

// --- Foco inicial no editor Python ---
pythonEditor.focus();
