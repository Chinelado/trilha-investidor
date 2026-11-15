// Análise da carteira: compara o que o usuário tem com a alocação-alvo que ele escolheu
// e aplica regras objetivas (reserva, FGC, concentração, teto de alto risco).
// É matemática sobre um alvo definido pelo usuário, não recomendação individual.
import type { Estado } from './estado';
import type { Risco } from '../data/mercado';
import { MERCADO } from '../data/mercado';
import { brl } from './formato';

export const CLASSES: { id: string; nome: string; ex: string; risco: Risco }[] = [
  { id: 'caixa', nome: 'Reserva e liquidez diária', ex: 'Tesouro Selic, CDB de liquidez diária, conta remunerada, poupança', risco: 'seguro' },
  { id: 'pos', nome: 'Renda fixa pós-fixada', ex: 'CDB, LCI e LCA atrelados ao CDI, com prazo', risco: 'seguro' },
  { id: 'infl', nome: 'Renda fixa IPCA+ e prefixada', ex: 'Tesouro IPCA+, Tesouro Prefixado, CDB IPCA ou prefixado', risco: 'moderado' },
  { id: 'credito', nome: 'Crédito privado, fundos e previdência', ex: 'Debêntures, CRI, CRA, fundos de renda fixa, multimercados, PGBL/VGBL', risco: 'moderado' },
  { id: 'fii', nome: 'Fundos imobiliários', ex: 'FIIs de tijolo, de papel, Fiagros', risco: 'moderado' },
  { id: 'acoes', nome: 'Ações e ETFs do Brasil', ex: 'Ações, ETFs de índice brasileiro, fundos de ações', risco: 'arrojado' },
  { id: 'exterior', nome: 'Exterior', ex: 'ETFs internacionais, BDRs, conta global', risco: 'arrojado' },
  { id: 'alt', nome: 'Cripto, ouro e alternativos', ex: 'Bitcoin, ETFs de cripto, ouro, COE', risco: 'alto' },
];
export const CLASSES_LONGO = CLASSES.filter((c) => c.id !== 'caixa');
export const nomeClasse = (id: string) => CLASSES.find((c) => c.id === id)?.nome || id;

/** Modelos didáticos de alocação da carteira de longo prazo (em %, somam 100). A reserva fica fora. */
export const MODELOS: Record<string, { nome: string; alvo: Record<string, number> }> = {
  conservador: { nome: 'Conservador', alvo: { pos: 55, infl: 30, credito: 5, fii: 5, acoes: 5, exterior: 0, alt: 0 } },
  moderado: { nome: 'Moderado', alvo: { pos: 30, infl: 28, credito: 5, fii: 10, acoes: 15, exterior: 10, alt: 2 } },
  arrojado: { nome: 'Arrojado', alvo: { pos: 12, infl: 23, credito: 5, fii: 15, acoes: 23, exterior: 19, alt: 3 } },
};

export function alvoEmUso(e: Estado): Record<string, number> {
  const c = e.carteira;
  if (c.modelo !== 'personalizado' && MODELOS[c.modelo]) return MODELOS[c.modelo].alvo;
  return { ...MODELOS.moderado.alvo, ...c.alvo };
}

export interface LinhaClasse { id: string; nome: string; risco: Risco; atual: number; alvo: number; dif: number; noAlvo: boolean }
export interface Analise {
  total: number;
  reservaAlvo: number;
  reservaAtual: number;
  longoPrazo: number;
  classes: LinhaClasse[];
  itens: { id: string; nome: string; classe: string; emissor?: string; valor: number; alvo: number; dif: number; noAlvo: boolean }[];
  transferencias: { de: string; para: string; valor: number }[];
  aporte: { classe: string; valor: number }[];
  alertas: { nivel: 'alto' | 'moderado' | 'seguro'; texto: string }[];
  somaAlvo: number;
}

export function analisar(e: Estado): Analise {
  const itens = e.carteira.itens;
  const total = itens.reduce((a, i) => a + i.valor, 0);
  const pct = alvoEmUso(e);
  const somaAlvo = CLASSES_LONGO.reduce((a, c) => a + (pct[c.id] || 0), 0);
  const atual: Record<string, number> = {};
  CLASSES.forEach((c) => (atual[c.id] = 0));
  itens.forEach((i) => (atual[i.classe] = (atual[i.classe] || 0) + i.valor));

  // 1) A reserva de emergência vem primeiro; o restante é a carteira de longo prazo.
  const reservaNecessaria = e.perfil.despesas * e.carteira.mesesReserva;
  const reservaAlvo = Math.min(reservaNecessaria, total);
  const longoPrazo = total - reservaAlvo;
  const tol = Math.max(50, total * 0.01);

  const classes: LinhaClasse[] = CLASSES.map((c) => {
    const alvo = c.id === 'caixa' ? reservaAlvo : somaAlvo ? (longoPrazo * (pct[c.id] || 0)) / somaAlvo : 0;
    const dif = alvo - atual[c.id];
    return { id: c.id, nome: c.nome, risco: c.risco, atual: atual[c.id], alvo, dif, noAlvo: Math.abs(dif) < tol };
  });

  // 2) Dentro de cada classe, o alvo é dividido na proporção do que já existe.
  const porClasse = Object.fromEntries(classes.map((c) => [c.id, c]));
  //    Exceção: quando a classe precisa crescer, a poupança não recebe o aumento se houver alternativa
  //    na mesma classe (ela rende menos com a mesma segurança); o acréscimo vai para os demais itens.
  const ehPoupanca = (n: string) => /poupan/i.test(n);
  const linhasItens = itens.map((i) => {
    const c = porClasse[i.classe];
    const outros = itens.filter((x) => x.classe === i.classe && !ehPoupanca(x.nome)).reduce((s, x) => s + x.valor, 0);
    let alvo = c.atual ? (i.valor / c.atual) * c.alvo : 0;
    if (c.dif > 0 && outros > 0 && outros < c.atual) alvo = ehPoupanca(i.nome) ? i.valor : i.valor + (i.valor / outros) * c.dif;
    const dif = alvo - i.valor;
    return { ...i, alvo, dif, noAlvo: c.noAlvo || Math.abs(dif) < 1 };
  });

  // 3) Remanejamento: tira de quem está acima do alvo e leva a quem está abaixo (reserva primeiro).
  const sobra = classes.filter((c) => !c.noAlvo && c.dif < 0).map((c) => ({ id: c.id, v: -c.dif })).sort((a, b) => b.v - a.v);
  const falta = classes.filter((c) => !c.noAlvo && c.dif > 0).map((c) => ({ id: c.id, v: c.dif })).sort((a, b) => (a.id === 'caixa' ? -1 : b.id === 'caixa' ? 1 : b.v - a.v));
  const transferencias: Analise['transferencias'] = [];
  for (const f of falta) {
    for (const s of sobra) {
      if (f.v < 1) break;
      const v = Math.min(f.v, s.v);
      if (v < 1) continue;
      transferencias.push({ de: s.id, para: f.id, valor: v });
      f.v -= v;
      s.v -= v;
    }
  }

  // 4) Próximo aporte: tudo na reserva enquanto ela não estiver completa; depois, proporcional ao que falta.
  const aporteMensal = e.perfil.aporte;
  let aporte: Analise['aporte'] = [];
  if (aporteMensal > 0) {
    const faltaReserva = Math.max(0, reservaNecessaria - atual.caixa);
    if (faltaReserva > tol) aporte = [{ classe: 'caixa', valor: aporteMensal }];
    else {
      const abaixo = classes.filter((c) => c.id !== 'caixa' && c.dif > 0);
      const soma = abaixo.reduce((a, c) => a + c.dif, 0);
      aporte = soma > 0
        ? abaixo.map((c) => ({ classe: c.id, valor: (aporteMensal * c.dif) / soma })).filter((a) => a.valor >= 1)
        : CLASSES_LONGO.filter((c) => pct[c.id] > 0).map((c) => ({ classe: c.id, valor: (aporteMensal * pct[c.id]) / somaAlvo }));
    }
  }

  // 5) Regras objetivas
  const alertas: Analise['alertas'] = [];
  const risco = atual.fii + atual.acoes + atual.exterior + atual.alt + atual.credito;
  if (!e.perfil.despesas) alertas.push({ nivel: 'moderado', texto: 'Informe suas despesas mensais em Metas. Sem isso não dá para calcular a reserva de emergência, e toda a carteira é tratada como longo prazo.' });
  else if (atual.caixa < reservaNecessaria - tol) {
    alertas.push({
      nivel: risco > 0 ? 'alto' : 'moderado',
      texto: `Reserva de emergência incompleta: você tem ${brl(atual.caixa)} em liquidez diária e o alvo é ${brl(reservaNecessaria)} (${e.carteira.mesesReserva} meses de despesas). ${risco > 0 ? 'Você já tem ativos que oscilam; um imprevisto pode forçar a venda deles em um momento ruim. ' : ''}Direcione os aportes para a reserva até completá-la.`,
    });
  } else alertas.push({ nivel: 'seguro', texto: `Reserva de emergência completa: ${brl(Math.min(atual.caixa, reservaNecessaria))} em liquidez diária.` });

  itens.filter((i) => /poupan/i.test(i.nome)).forEach((i) =>
    alertas.push({ nivel: 'moderado', texto: `"${i.nome}": a poupança rende cerca de ${MERCADO.poupanca.toFixed(0)}% ao ano, abaixo de um Tesouro Selic ou CDB de 100% do CDI com liquidez diária, que têm segurança equivalente (lição 4).` }),
  );

  const porEmissor: Record<string, number> = {};
  itens.filter((i) => i.emissor && ['caixa', 'pos', 'infl'].includes(i.classe) && !/tesouro/i.test(i.nome + i.emissor)).forEach((i) => {
    const k = i.emissor!.trim().toLowerCase();
    porEmissor[k] = (porEmissor[k] || 0) + i.valor;
  });
  Object.entries(porEmissor).filter(([, v]) => v > MERCADO.fgc).forEach(([k, v]) =>
    alertas.push({ nivel: 'alto', texto: `Você tem ${brl(v)} em títulos bancários de "${k}". O FGC cobre até ${brl(MERCADO.fgc)} por instituição, contando os juros. O excedente de ${brl(v - MERCADO.fgc)} fica sem garantia (lição 6).` }),
  );

  if (longoPrazo > 0) {
    itens.filter((i) => ['acoes', 'fii', 'alt', 'credito', 'exterior'].includes(i.classe) && i.valor / longoPrazo > 0.2 && !/etf|índice|indice|fundo/i.test(i.nome)).forEach((i) =>
      alertas.push({ nivel: 'moderado', texto: `"${i.nome}" representa ${((i.valor / longoPrazo) * 100).toFixed(0)}% da carteira de longo prazo. Mais de 20% em um único ativo de risco é concentração alta (lição 11).` }),
    );
    if (atual.alt / longoPrazo > 0.05)
      alertas.push({ nivel: 'alto', texto: `Cripto, ouro e alternativos somam ${((atual.alt / longoPrazo) * 100).toFixed(0)}% da carteira de longo prazo. A faixa prudente tratada na lição 21 é de 1% a 5%.` });
    const rv = (atual.acoes + atual.exterior + atual.alt + atual.fii) / longoPrazo;
    if (rv > 0.7) alertas.push({ nivel: 'moderado', texto: `Renda variável soma ${(rv * 100).toFixed(0)}% da carteira de longo prazo. Confira se você aguentaria uma queda de 40% nessa parcela sem vender (lição 10).` });
  }
  if (Math.round(somaAlvo) !== 100) alertas.push({ nivel: 'moderado', texto: `Sua alocação-alvo soma ${somaAlvo}%. Ajuste para 100%; por enquanto os percentuais foram reescalados na proporção.` });

  return { total, reservaAlvo: reservaNecessaria, reservaAtual: atual.caixa, longoPrazo, classes, itens: linhasItens, transferencias, aporte, alertas, somaAlvo };
}

/**
 * Divide um valor novo entre as categorias: primeiro completa a reserva de emergência,
 * depois preenche o que está abaixo do alvo (considerando o total já com o valor novo).
 * "pct" permite usar a alocação de um perfil específico em vez da escolhida na página Carteira.
 */
export function distribuir(e: Estado, valor: number, pct: Record<string, number> = alvoEmUso(e)): { classe: string; valor: number }[] {
  const atual: Record<string, number> = {};
  CLASSES.forEach((c) => (atual[c.id] = 0));
  e.carteira.itens.forEach((i) => (atual[i.classe] = (atual[i.classe] || 0) + i.valor));
  const total = e.carteira.itens.reduce((a, i) => a + i.valor, 0);
  const reservaNec = e.perfil.despesas * e.carteira.mesesReserva;
  const out: { classe: string; valor: number }[] = [];
  let resto = valor;
  const faltaReserva = Math.max(0, reservaNec - atual.caixa);
  if (faltaReserva > 0) {
    const v = Math.min(resto, faltaReserva);
    out.push({ classe: 'caixa', valor: v });
    resto -= v;
  }
  if (resto < 1) return out;
  const soma = CLASSES_LONGO.reduce((a, c) => a + (pct[c.id] || 0), 0) || 1;
  const novoTotal = total + valor;
  const longo = novoTotal - Math.min(reservaNec, novoTotal);
  // O que sobra de liquidez acima da reserva já conta como renda fixa pós-fixada.
  const excedenteCaixa = Math.max(0, atual.caixa - reservaNec);
  const lacunas = CLASSES_LONGO.map((c) => ({ classe: c.id, v: Math.max(0, (longo * (pct[c.id] || 0)) / soma - atual[c.id] - (c.id === 'pos' ? excedenteCaixa : 0)) }));
  const somaLacunas = lacunas.reduce((a, l) => a + l.v, 0);
  const partes = somaLacunas > 0 ? lacunas.map((l) => ({ classe: l.classe, valor: (resto * l.v) / somaLacunas })) : CLASSES_LONGO.map((c) => ({ classe: c.id, valor: (resto * (pct[c.id] || 0)) / soma }));
  return [...out, ...partes.filter((p) => p.valor >= 1)];
}
