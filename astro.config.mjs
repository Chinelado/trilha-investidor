import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Depois do build: lista todos os arquivos gerados em precache.json e carimba a versão do cache
// no service worker. Assim o app instalado guarda o site inteiro e funciona sem internet.
const offline = {
  name: 'trilha-offline',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const raiz = fileURLToPath(dir);
      const arquivos = [];
      const andar = (pasta) => {
        for (const nome of readdirSync(pasta)) {
          const caminho = join(pasta, nome);
          if (statSync(caminho).isDirectory()) andar(caminho);
          else {
            const rel = relative(raiz, caminho).replace(/\\/g, '/');
            if (rel === 'sw.js' || rel === 'precache.json') continue;
            arquivos.push(rel.endsWith('index.html') ? rel.slice(0, -'index.html'.length) || './' : rel);
          }
        }
      };
      andar(raiz);
      writeFileSync(join(raiz, 'precache.json'), JSON.stringify(arquivos));
      const sw = join(raiz, 'sw.js');
      writeFileSync(sw, readFileSync(sw, 'utf8').replace('trilha-dev', 'trilha-' + Date.now().toString(36)));
      console.log(`[trilha-offline] ${arquivos.length} arquivos no precache`);
    },
  },
};

// Para publicar em subpasta (ex.: GitHub Pages), defina BASE_PATH=/nome-do-repo/ antes do build.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [offline],
});
