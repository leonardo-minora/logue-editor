/**
 * Logue Editor - Entrada principal (modo desktop)
 *
 * Inicia um servidor HTTP local para servir os arquivos estáticos
 * e abre a aplicação em uma janela nativa usando webview.
 *
 * Uso: deno task start
 *
 * Permissões necessárias:
 *   --allow-net      Servidor HTTP local
 *   --allow-read     Leitura dos arquivos estáticos
 *   --allow-env      Variáveis de ambiente do sistema
 *   --allow-ffi      FFI para o webview nativo
 *   --unstable       API webview ainda em estabilização
 */

import { Webview } from "https://deno.land/x/webview@0.7.6/mod.ts";
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

const PORT = 7700;
const HOST = "127.0.0.1";
const APP_URL = `http://${HOST}:${PORT}/index.html`;

// Resolve o diretório src relativo ao arquivo main.ts
const srcDir = new URL("./src", import.meta.url).pathname;

const ac = new AbortController();

// Inicia o servidor HTTP para servir os arquivos estáticos da pasta src/
const server = Deno.serve(
  {
    port: PORT,
    hostname: HOST,
    signal: ac.signal,
    onListen: ({ hostname, port }) => {
      console.log(`[Logue Editor] Servidor em http://${hostname}:${port}`);
    },
  },
  (req) =>
    serveDir(req, {
      fsRoot: srcDir,
      urlRoot: "",
      quiet: true,
    }),
);

// Pequena espera para garantir que o servidor esteja pronto
await new Promise<void>((resolve) => setTimeout(resolve, 300));

console.log("[Logue Editor] Abrindo janela desktop...");

// Cria e configura a janela webview
const webview = new Webview(false);
webview.title = "Logue Editor";
webview.navigate(APP_URL);
webview.run(); // Bloqueia até o usuário fechar a janela

// Encerra o servidor HTTP ao fechar a janela
console.log("[Logue Editor] Encerrando servidor...");
ac.abort();
await server.finished;
