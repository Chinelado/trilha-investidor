import type { Estado } from './estado';
import { brl, mesesAte, duracao } from './formato';

export const JURO_REAL_PROJECAO = 5; // % a.a. acima da inflação, premissa conservadora para projeções longas

export interface Marco {
  id: string;
  nome: string;
  detalhe: string;
  progresso: number; // 0–1
  feito: boolean;
  prazo: string;
}

/** Patrimônio total considerado: último registro mensal, ou reserva + investido do perfil. */
export function patrimonioAtual(e: Estado): number {
  if (e.patrimonio.length) return e.patrimonio[e.patrimonio.length - 1].valor;
  return e.perfil.reserva + e.perfil.investido;
}

/** Marcos de patrimônio calculados com os números do usuário. Retorna null se o perfil não foi preenchido. */
export function marcos(e: Estado): Marco[] | null {
  const p = e.perfil;
  if (!p.renda || !p.despesas) return null;
  const total = Math.max(patrimonioAtual(e), p.reserva);
  const taxa = p.renda ? p.aporte / p.renda : 0;
  const prazo = (alvo: number) => {
    if (total >= alvo) return 'atingida';
    if (!p.aporte) return 'defina um aporte mensal';
    return 'faltam cerca de ' + duracao(mesesAte(alvo, total, p.aporte, JURO_REAL_PROJECAO));
  };
  const valor = (id: string, nome: string, alvo: number, detalhe: string, base = total): Marco => ({
    id, nome, detalhe: `${detalhe} Alvo: ${brl(alvo)}.`, progresso: Math.min(1, base / alvo), feito: base >= alvo, prazo: prazo(alvo),
  });
  const pTaxa = (id: string, alvo: number): Marco => ({
    id,
    nome: `Poupar ${alvo * 100}% da renda`,
    detalhe: `Aporte mensal de pelo menos ${brl(p.renda * alvo)}. Hoje você aporta ${brl(p.aporte)} (${(taxa * 100).toFixed(0)}%).`,
    progresso: Math.min(1, taxa / alvo),
    feito: taxa >= alvo,
    prazo: taxa >= alvo ? 'atingida' : `aumente o aporte em ${brl(p.renda * alvo - p.aporte)}`,
  });
  const reserva = Math.max(p.reserva, 0);
  return [
    { id: 'orcamento', nome: 'Orçamento mapeado', detalhe: 'Renda, despesas e aporte registrados.', progresso: 1, feito: true, prazo: 'atingida' },
    pTaxa('taxa10', 0.1),
    valor('res1', 'Reserva de 1 mês', p.despesas, 'Primeiro colchão contra imprevistos.', reserva),
    valor('res3', 'Reserva de 3 meses', p.despesas * 3, 'Mínimo para quem tem renda estável.', reserva),
    valor('res6', 'Reserva de 6 meses', p.despesas * 6, 'Reserva completa: libera a renda variável.', reserva),
    pTaxa('taxa20', 0.2),
    valor('ano1', '1 ano de despesas investido', p.despesas * 12, 'Um ano inteiro de liberdade guardado.'),
    valor('cem', 'Primeiros R$ 100 mil', 100_000, 'A partir daqui os juros começam a pesar de verdade.'),
    valor('if', 'Independência financeira', p.despesas * 12 * 25, 'Patrimônio de 25 vezes o gasto anual (regra dos 4%).'),
  ];
}
