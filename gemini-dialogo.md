Para o que você está propondo, o seu editor de código está assumindo a função de um **ambiente de avaliação ou Kiosk** (bloqueado para evitar distrações e colas), combinado com um editor de notas/documentação técnica interativo.

Para alcançar esse nível de controle sobre o sistema operacional (forçar tela cheia e mitigar a troca de aplicativos) mantendo a divisão de tela com um editor de texto robusto, a melhor escolha técnica é o **Electron**. O Tauri também é uma opção, mas o Electron possui APIs de gerenciamento de janelas e travamento de foco em nível de sistema operacional muito mais maduras para ambientes educacionais restritos.

Aqui está a arquitetura e os componentes necessários para construir essa solução:

---

## 🔒 1. Mecanismo de Bloqueio (Modo Quiosque / Kiosk)

Para evitar que o aluno saia do aplicativo ou use atalhos (como `Alt+Tab` ou `Cmd+Tab`), você precisará configurar a janela principal do Electron com propriedades estritas de bloqueio.

No arquivo principal (`main.js`) do seu app Electron, configure a janela desta forma:

```javascript
const { app, BrowserWindow } = require('electron');

function createKioskWindow() {
  const win = new BrowserWindow({
    fullscreen: true,       // Força a tela cheia nativa
    kiosk: true,            // Ativa o modo quiosque (esconde barras e menus do SO)
    alwaysOnTop: true,      // Garante que o app fique acima de qualquer notificação
    movable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
  
  // Evita que o aluno feche a janela sem uma senha de administrador/professor
  win.on('close', (e) => {
    // e.preventDefault(); // Descomente para bloquear o fechamento padrão
    // Aqui você pode abrir um modal pedindo a "Senha do Professor" para liberar a saída
  });
}

app.whenReady().then(createKioskWindow);

```

> ⚠️ **Nota importante de segurança:** Embora o modo `kiosk` do Electron bloqueie interações comuns, sistemas operacionais modernos têm atalhos de acessibilidade profundos (como as teclas `Super/Windows` ou gerenciadores de tarefas). Para um bloqueio 100% à prova de fraudes, o ideal é que esse aplicativo rode em um usuário do sistema operacional configurado com permissões limitadas de estudante.

---

## 🎨 2. Divisão da Tela e Interface (Frontend)

Para a interface dividida em duas partes, você usará HTML estruturado e CSS moderno (Flexbox ou Grid), garantindo que cada metade ocupe exatamente 50% do espaço vertical ou horizontal livre.

### O Editor de Código (Lado Esquerdo)

Para o componente com **Syntax Highlighting** (realce de sintaxe), você não deve tentar criar um campo de texto puro com CSS. Utilize bibliotecas prontas que fornecem o comportamento de uma IDE:

1. **Monaco Editor:** É o próprio motor que alimenta o VS Code. Possui o melhor auto-complete e realce de sintaxe do mercado, suportando centenas de linguagens.
2. **CodeMirror (Versão 6):** Excelente alternativa, muito mais leve que o Monaco e extremamente modular. É o utilizado pelo Obsidian.

### A Pré-visualização de Markdown (Lado Direito)

O lado direito deve escutar o que está sendo digitado no editor em tempo real, converter o Markdown para HTML e renderizar na tela.

1. **marked.js / markdown-it:** Bibliotecas JavaScript rápidas que convertem strings Markdown em HTML puro.
2. **DOMPurify:** **Indispensável.** Como os alunos podem tentar digitar códigos maliciosos (`<script>...</script>`) no editor, você deve passar o HTML gerado pelo Markdown por um sanitizador antes de exibir na tela para evitar falhas de segurança no aplicativo.

---

## 📐 Estrutura Visual Sugerida (Layout)

```
+-----------------------------------------------------------------------+
|  [Barra Superior Opcional: Nome do Aluno | Cronômetro | Botão Entregar]  |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
|  PAINEL ESQUERDO: EDITOR          |  PAINEL DIREITO: PREVIEW          |
|                                   |                                   |
|  1  function calcular(a, b) {     |  ### Exercício 1                  |
|  2    let resultado = a + b;      |  Crie uma função que some dois    |
|  3    return resultado;           |  números inteiros...              |
|  4  }                             |                                   |
|                                   |  **Saída esperada:**              |
|                                   |  `calcular(2, 3) -> 5`            |
|                                   |                                   |
+-----------------------------------+-----------------------------------+

```

### Exemplo rápido de como conectar os dois lados (JS no Frontend):

```javascript
import CodeMirror from 'codemirror';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Inicializa o editor na div esquerda
const editor = CodeMirror(document.getElementById('editor-container'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'dracula'
});

// Atualiza o preview sempre que o aluno digitar algo
editor.on('change', () => {
  const codigoRaw = editor.getValue();
  
  // Converte Markdown para HTML com segurança
  const htmlSujo = marked.parse(codigoRaw);
  const htmlSeguro = DOMPurify.sanitize(htmlSujo);
  
  // Renderiza no lado direito
  document.getElementById('preview-container').innerHTML = htmlSeguro;
});

```

Usando o **Electron** com **CodeMirror** e **Marked**, você consegue criar esse ambiente controlado de forma ágil, oferecendo uma experiência fluida para o aluno e segurança para a aplicação das avaliações de lógica de programação.
