/**
 * Logue Editor - Servidor web (modo navegador)
 *
 * Alternativa ao modo desktop para ambientes sem suporte a FFI.
 * Inicia um servidor HTTP e exibe a URL para abrir no navegador.
 *
 * Uso: deno task serve
 *
 * Permissões necessárias:
 *   --allow-net    Servidor HTTP local
 *   --allow-read   Leitura dos arquivos estáticos
 */

import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

const PORT = 7700;
const HOST = "127.0.0.1";

const srcDir = new URL("./src", import.meta.url).pathname;

console.log("╔══════════════════════════════════════╗");
console.log("║          LOGUE EDITOR                ║");
console.log("╚══════════════════════════════════════╝");
console.log(`\n🚀 Servidor iniciado!`);
console.log(`   Abra no navegador: http://localhost:${PORT}/index.html\n`);

Deno.serve(
  { port: PORT, hostname: HOST },
  (req) =>
    serveDir(req, {
      fsRoot: srcDir,
      urlRoot: "",
      quiet: true,
    }),
);
