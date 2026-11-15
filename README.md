# Trilha do Investidor

Sistema pessoal de aprendizado sobre investimentos no Brasil. Site estático em Astro, instalável como app (PWA), com os dados cifrados no próprio dispositivo.

Plano e roadmap: [PLANO.md](PLANO.md).

## Rodar no computador

```bash
npm install
npm run dev
```

Abra `http://localhost:4321`.

## Publicar

O repositório contém apenas o código e o conteúdo das lições. Seus dados pessoais (progresso, metas, carteira) **não** ficam no repositório nem no site publicado: existem só no navegador de cada aparelho, cifrados com a sua senha.

### GitHub Pages

1. Crie um repositório no GitHub e envie este projeto para a branch `main`.
2. No repositório: Settings → Pages → Source → **GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` faz o build e publica em `https://<usuario>.github.io/<repositorio>/`.

No plano gratuito, o GitHub Pages exige repositório público. O conteúdo é genérico (lições e código), mas fica visível para qualquer pessoa.

### Netlify ou Vercel

Conecte o repositório (pode ser privado). As configurações estão em `netlify.toml` e `vercel.json`.

## Depois de publicar

- Abra o endereço no celular e instale: Android (Chrome) → menu ⋮ → "Instalar app"; iPhone (Safari) → Compartilhar → "Adicionar à Tela de Início".
- No computador, exporte um backup em Ajustes e restaure no celular com a mesma senha.

## Segurança

- Dados cifrados com AES-256-GCM; chave derivada da senha com PBKDF2-SHA256 (600 mil iterações).
- Sem servidor, sem conta, sem rastreamento. A única conexão externa é a consulta opcional aos indicadores públicos do Banco Central.
- Uma política de segurança de conteúdo (CSP) impede o carregamento de scripts de terceiros e o envio de dados a outros domínios.
- Sem a senha não há recuperação. Faça backups.

## Manter o conteúdo em dia

Números de mercado e regras de imposto ficam em `src/data/mercado.ts`, com a data de validação. Revise a cada 30–45 dias e a cada virada de ano.
