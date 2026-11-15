// Panorama de mercado embutido no conteúdo. Revise a cada 30–45 dias (ou use o botão da página Mercado,
// que consulta a API pública do Banco Central e atualiza Selic, CDI, IPCA e dólar no dispositivo).

export const MERCADO = {
  validadoEm: '2026-11-14',
  selic: 13.75, // meta Selic, % a.a. (Copom de 04/11/2026 manteve)
  cdi: 13.65, // % a.a.
  ipca12m: 4.63, // IPCA acumulado em 12 meses até out/2026
  ipcaMes: 0.14, // out/2026
  metaInflacao: 3.0,
  tetoMeta: 4.5,
  dolar: 5.65, // fechamento de 13/11/2026
  ibovespa: 172457, // fechamento de 13/11/2026
  poupanca: 8.0, // aprox. % a.a. (0,5% a.m. + TR, regra para Selic acima de 8,5%)
  fgc: 250000,
  tesouro: [
    { titulo: 'Tesouro Selic', taxa: 'Selic + ~0,05%', risco: 'seguro', uso: 'Reserva de emergência e curto prazo' },
    { titulo: 'Tesouro Prefixado 2029', taxa: '14,65% a.a.', risco: 'moderado', uso: 'Travar a taxa por ~3 anos' },
    { titulo: 'Tesouro Prefixado 2032', taxa: '15,13% a.a.', risco: 'moderado', uso: 'Travar a taxa por ~6 anos' },
    { titulo: 'Tesouro IPCA+ 2032', taxa: 'IPCA + 7,66% a.a.', risco: 'moderado', uso: 'Proteger da inflação no médio prazo' },
    { titulo: 'Tesouro IPCA+ 2050', taxa: 'IPCA + 7,48% a.a.', risco: 'moderado', uso: 'Aposentadoria e prazos longos' },
  ],
  contexto: [
    'O Copom manteve a Selic em 13,75% ao ano em 04/11/2026, interrompendo a sequência de cortes iniciada depois do pico de 15%.',
    'O IPCA acumula 4,63% em 12 meses, acima do teto da meta (4,5%). Por isso o Banco Central está cauteloso.',
    'O juro real (Selic descontada a inflação) está perto de 8,7% ao ano, um dos mais altos do mundo. Renda fixa segura paga muito bem neste momento.',
    'O dólar fechou em R$ 5,65 em 13/11/2026, a maior cotação do ano, com incerteza fiscal no radar.',
    'O Ibovespa está na faixa de 172 mil pontos.',
    'O limite do FGC segue em R$ 250 mil por CPF e por instituição (teto de R$ 1 milhão a cada 4 anos). Depois do caso Banco Master, as regras ficaram mais duras para os bancos, não para o investidor.',
  ],
  tributacao: [
    { item: 'CDB, Tesouro Direto, debêntures comuns, fundos de renda fixa', regra: 'Tabela regressiva: 22,5% (até 180 dias), 20% (181–360), 17,5% (361–720), 15% (acima de 720), sobre o rendimento' },
    { item: 'LCI, LCA, CRI, CRA, debêntures incentivadas, poupança', regra: 'Isentos de IR para pessoa física. A proposta de tributar em 5% (MP 1.303/2025) perdeu a validade e não virou lei' },
    { item: 'Ações (operações comuns)', regra: '15% sobre o lucro. Isento se as vendas no mês somarem até R$ 20 mil' },
    { item: 'Day trade', regra: '20% sobre o lucro, sem isenção' },
    { item: 'FIIs', regra: 'Rendimentos mensais isentos (cumpridos os requisitos legais). Lucro na venda de cotas: 20%' },
    { item: 'ETFs de ações', regra: '15% sobre o lucro na venda, sem a isenção dos R$ 20 mil' },
    { item: 'Dividendos de ações', regra: 'Isentos até R$ 50 mil por mês, por empresa. Acima disso, 10% retidos na fonte (Lei 15.270/2025, vale desde 2026)' },
    { item: 'Investimentos no exterior', regra: '15% sobre ganhos e rendimentos, apurados na declaração anual (Lei 14.754/2023)' },
    { item: 'Fundos abertos', regra: 'Come-cotas em maio e novembro (15% nos de longo prazo, 20% nos de curto prazo)' },
    { item: 'Previdência (PGBL/VGBL)', regra: 'Tabela progressiva ou regressiva (chega a 10% após 10 anos). PGBL permite deduzir até 12% da renda tributável' },
  ],
  fontes: [
    { nome: 'Banco Central — taxa Selic e sistema de séries temporais', url: 'https://www.bcb.gov.br/controleinflacao/taxaselic' },
    { nome: 'IBGE — IPCA', url: 'https://www.ibge.gov.br/explica/inflacao.php' },
    { nome: 'Tesouro Direto — preços e taxas', url: 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm' },
    { nome: 'FGC — garantia', url: 'https://www.fgc.org.br/garantia-fgc/sobre-a-garantia-fgc' },
    { nome: 'B3 — Bora Investir', url: 'https://borainvestir.b3.com.br/' },
    { nome: 'CVM — Portal do Investidor', url: 'https://www.gov.br/investidor/pt-br' },
    { nome: 'Receita Federal — Meu Imposto de Renda', url: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda' },
  ],
};

export type Risco = 'seguro' | 'moderado' | 'arrojado' | 'alto';

export const RISCOS: Record<Risco, { nome: string; icone: string; desc: string }> = {
  seguro: { nome: 'Seguro', icone: '🛡', desc: 'Baixa chance de perda. Garantia do governo ou do FGC, com liquidez.' },
  moderado: { nome: 'Moderado', icone: '⚖', desc: 'Oscila no caminho ou tem risco de crédito. Exige prazo e atenção.' },
  arrojado: { nome: 'Arrojado', icone: '📈', desc: 'Pode cair bastante no curto prazo. Só para dinheiro de longo prazo.' },
  alto: { nome: 'Alto risco', icone: '⚠', desc: 'Perda total é possível. Só uma parcela pequena, depois de dominar o resto.' },
};

export const MAPA_RISCO: { risco: Risco; ativos: { nome: string; nota: string }[] }[] = [
  {
    risco: 'seguro',
    ativos: [
      { nome: 'Tesouro Selic', nota: 'Garantido pelo Tesouro Nacional, liquidez diária' },
      { nome: 'CDB de liquidez diária de banco grande', nota: 'Coberto pelo FGC até R$ 250 mil' },
      { nome: 'LCI e LCA dentro do FGC', nota: 'Isentas de IR, mas com carência' },
      { nome: 'Poupança', nota: 'Segura, porém rende menos que as opções acima' },
    ],
  },
  {
    risco: 'moderado',
    ativos: [
      { nome: 'Tesouro Prefixado e IPCA+', nota: 'Seguros no vencimento, oscilam se vendidos antes' },
      { nome: 'CDB de banco médio acima do FGC', nota: 'Risco de crédito do emissor' },
      { nome: 'Debêntures, CRI e CRA de boa qualidade', nota: 'Sem FGC' },
      { nome: 'Fundos de renda fixa e multimercados conservadores', nota: 'Dependem do gestor e das taxas' },
      { nome: 'FIIs de tijolo e de papel diversificados', nota: 'Renda mensal, cota oscila' },
    ],
  },
  {
    risco: 'arrojado',
    ativos: [
      { nome: 'Ações de empresas sólidas', nota: 'Quedas de 30% ou mais acontecem' },
      { nome: 'ETFs de ações (Brasil e exterior)', nota: 'Diversificados, mas seguem a bolsa' },
      { nome: 'BDRs e investimentos em dólar', nota: 'Somam risco de bolsa e de câmbio' },
      { nome: 'Multimercados e fundos de ações', nota: 'Taxas maiores, resultado incerto' },
    ],
  },
  {
    risco: 'alto',
    ativos: [
      { nome: 'Criptomoedas', nota: 'Oscilações de 50% ou mais são comuns' },
      { nome: 'Small caps e ações de empresas endividadas', nota: 'Pouca liquidez, risco de falência' },
      { nome: 'Opções, futuros e operações alavancadas', nota: 'É possível perder mais do que o investido' },
      { nome: 'Day trade', nota: 'A grande maioria das pessoas físicas perde dinheiro' },
      { nome: 'Crédito de alto rendimento (high yield) e COE complexo', nota: 'Retorno alto reflete chance real de calote' },
    ],
  },
];
