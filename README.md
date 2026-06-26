# Logue - Editor de códigos-fonte

## Informações gerais

- **Público alvo**: alunos da disciplina de **Introdução a lógica e programação**
- **Objetivo**: Editor de código-fonte sem auxílios e com problemas iniciais de lógica.
- **Metáfora**: o nome _logue_ é inspirado em Loguetown (a cidade do início e do fim) do anime One piece, metaforicamente o lugar onde a jornada dos códigos começa. Também faz um trocadilho sutil com log (registro/lógica).

---

## Projeto inicial

inicialmente temos _branchs_ para testar tecnologias e avançar para uma versão usável.

---

## Branch `genese-deno` — Protótipo com Deno Desktop

Aplicativo desktop multiplataforma construído com **Deno** e tecnologias web.

### Layout

```
┌──────────────────────────────────────┐
│             Header fixo              │  ← título, nome do arquivo, botões
├──────────────────┬───────────────────┤
│ Visualizador     │  Editor Python    │  ← painéis independentes
│ Markdown         │  (CodeMirror 5 +  │
│ (esquerda)       │   tema Monokai)   │
│                  │                   │
│ abas: Fonte /    │  numeração de     │
│       Prévia     │  linhas, indent 4 │
└──────────────────┴───────────────────┘
         ↑ barra arrastável
```

### Tecnologias

| Tecnologia | Papel |
|------------|-------|
| [Deno](https://deno.land) | Runtime e servidor HTTP |
| [webview_deno](https://deno.land/x/webview) | Janela desktop nativa |
| [CodeMirror 5](https://codemirror.net/5) | Editor Python com syntax highlight |
| [marked.js](https://marked.js.org) | Renderizador de Markdown |

### Pré-requisitos

- [Deno](https://docs.deno.com/runtime/getting_started/installation/) ≥ 1.40

### Executar

**Modo desktop** (abre janela nativa — requer FFI):
```bash
deno task start
```

**Modo navegador** (sem FFI, abre em `http://localhost:7700`):
```bash
deno task serve
```

### Funcionalidades

- **Header fixo**: nome do arquivo editável + botões Novo / Abrir / Salvar / Executar
- **Painel esquerdo — Markdown**: editor de fonte + prévia renderizada em tempo real (abas)
- **Painel direito — Python**: editor com highlight, numeração de linhas e auto-indentação
- **Redimensionador**: barra arrastável entre os painéis (mínimo 20 %, máximo 80 %)
- **Atalhos**: `Ctrl+S` Salvar · `Ctrl+O` Abrir · `Ctrl+N` Novo