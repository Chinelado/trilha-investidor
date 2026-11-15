# Trilha do Investidor — plano de criação e roadmap

Sistema pessoal de aprendizado sobre investimentos, feito para quem mora no Brasil e está começando do zero.

## Decisões tomadas (14/11/2026)

| Tema | Decisão |
|------|---------|
| Nível de partida | Iniciante: a trilha começa em orçamento e reserva de emergência |
| Ritmo | 1 lição por semana (30–40 min) + pílula diária opcional (3–5 min) |
| Dados | Só no dispositivo, cifrados com senha (AES-256-GCM, chave via PBKDF2). Sem servidor e sem conta |
| Laptop ↔ celular | Backup cifrado exportado em um aparelho e importado no outro |
| Acesso | Site estático em Astro, instalável como app (PWA) e utilizável offline |
| Dados de mercado | Valores validados em 14/11/2026 embutidos + botão que consulta a API pública do Banco Central |

## Arquitetura

- **Astro (estático)**: todo o conteúdo é gerado no build; não existe backend.
- **Conteúdo** em `src/data/`: lições, glossário, perguntas frequentes e panorama de mercado.
- **Cofre** em `src/lib/cofre.ts`: cifra o estado (progresso, metas, patrimônio, anotações) antes de gravar no `localStorage`.
  A senha nunca é gravada. A chave fica na sessão da aba e é descartada após 15 minutos sem uso.
- **Gráficos** em `src/lib/graficos.ts`: SVG/HTML próprios, sem biblioteca externa, com tabela de dados alternativa.
- **PWA**: `public/manifest.webmanifest` + `public/sw.js` (cache para uso offline).

## Páginas

| Página | Função |
|--------|--------|
| Início | Painel: lição da semana, pílula do dia, sequência, progresso, indicadores |
| Trilha | 24 semanas em 6 módulos, com liberação semanal |
| Lição | Conteúdo, gráfico, classificação de risco, exercícios, missão prática, anotações |
| Diário | Pílula do dia: 1 termo do glossário + 2 perguntas de revisão |
| Perfil | Perfil de investidor (tolerância, capacidade e conhecimento), categorias compatíveis e divisão de um valor a investir |
| Carteira | Cadastro dos investimentos atuais, comparação com a alocação-alvo, quanto deveria estar em cada um e o que remanejar |
| Metas | Metas de estudo e marcos de patrimônio calculados a partir da sua renda e despesas |
| Resumo | Resumo de sessões: o que foi aprendido, notas, tempo de estudo, anotações |
| Ferramentas | Simulador de juros compostos, comparador de renda fixa, equivalência LCI × CDB |
| Mercado | Indicadores atuais, mapa de risco por classe de ativo, tributação |
| Glossário | Termos do mercado com busca |
| Dúvidas | Perguntas frequentes |
| Ajustes | Senha, backup cifrado, ritmo, instalação no celular |

## Trilha de 24 semanas

1. **Fundamentos** (semanas 1–4): orçamento, juros compostos e inflação, Selic/CDI/IPCA, reserva de emergência.
2. **Renda fixa** (5–9): Tesouro Direto, CDB/LCI/LCA e FGC, impostos, crédito privado, fundos.
3. **Estratégia** (10–12): risco e perfil, alocação e diversificação, psicologia e golpes.
4. **Renda variável** (13–18): bolsa, análise de empresas, dividendos, FIIs, ETFs, imposto.
5. **Além do básico** (19–22): exterior, previdência, cripto e ouro, derivativos.
6. **Plano de vida** (23–24): rebalanceamento e independência financeira.

## Metas tangíveis

**De estudo:** 1 lição por semana, nota mínima de 70% nos exercícios, sequência de 7 dias na pílula diária, trilha concluída em 24 semanas.

**De patrimônio** (calculadas com os seus números): orçamento mapeado → poupar 10% da renda → reserva de 1, 3 e 6 meses → poupar 20% → 1 ano de despesas investido → primeiros R$ 100 mil → 25× as despesas anuais (independência financeira).

## Roadmap

- [x] Fase 0 — Levantamento de decisões e validação dos dados de mercado
- [x] Fase 1 — Projeto Astro, identidade visual, navegação, PWA
- [x] Fase 2 — Cofre cifrado, bloqueio por senha, backup/importação
- [x] Fase 3 — Conteúdo: 24 lições com exercícios e missões práticas
- [x] Fase 4 — Painel, pílula diária, metas e resumo de sessões
- [x] Fase 5 — Ferramentas, panorama de mercado, glossário e dúvidas
- [x] Fase 6 — Build e teste no navegador (desktop e largura de celular)
- [x] Fase 6b — Novo visual (barra lateral, checklist de primeiros passos, cartões pastel) a partir das referências enviadas
- [x] Fase 6c — Página Carteira com análise e plano de remanejamento
- [x] Fase 6d — Página Perfil: perfil de investidor alimentado pelo questionário, pela carteira e pelo progresso na trilha
- [x] Fase 6e — Preparação da publicação: precache offline, política de segurança (CSP), workflow do GitHub Pages, netlify.toml, vercel.json, README, repositório git local
- [ ] Fase 7 — Publicação (Vercel, Netlify ou GitHub Pages) — depende da sua autorização
- [ ] Fase 8 — Evoluções: módulos avançados (valuation, opções), revisão trimestral do conteúdo, lembretes

## Manutenção do conteúdo

Os números de mercado ficam em `src/data/mercado.ts`, com a data de validação. A página Mercado avisa quando a validação passa de 45 dias.
Regras tributárias mudam: revise `mercado.ts` e as lições 7, 15, 18, 19 e 20 a cada virada de ano.

## Aviso

Conteúdo educacional. Não é recomendação individual de investimento.
