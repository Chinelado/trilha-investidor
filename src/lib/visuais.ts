// Gráficos usados dentro das lições. Todos usam os indicadores atuais (Selic, CDI, IPCA).
import { linhas, barras, empilhadas } from './graficos';
import { brl, brlCurto, pct, projetar, aliquotaIR, rendimentoNoPrazo } from './formato';

interface M { selic: number; cdi: number; ipca: number; dolar: number }

const anos = (n: number) => Array.from({ length: n + 1 }, (_, i) => (i === 0 ? 'Hoje' : `${i} a`));

/** Rendimento líquido em 1 ano das opções de renda fixa mais comuns, para R$ 10 mil. */
export function comparativoRendaFixa(m: M, poupanca: number) {
  const liq = (bruto: number) => bruto * (1 - aliquotaIR(365) / 100);
  return [
    { rotulo: 'CDB 110% do CDI', nota: 'banco médio, com FGC', valor: liq(m.cdi * 1.1) },
    { rotulo: 'Tesouro Selic', nota: 'governo federal', valor: liq(m.selic) - 0.2 },
    { rotulo: 'CDB 100% do CDI', nota: 'liquidez diária', valor: liq(m.cdi) },
    { rotulo: 'LCI/LCA 85% do CDI', nota: 'isenta de IR', valor: m.cdi * 0.85 },
    { rotulo: 'Poupança', nota: 'isenta de IR', valor: poupanca },
  ].sort((a, b) => b.valor - a.valor);
}

export const VISUAIS: Record<string, { titulo: string; legenda: (m: M) => string; montar: (el: HTMLElement, m: M, poupanca: number) => void }> = {
  juros: {
    titulo: 'R$ 500 por mês durante 30 anos',
    legenda: () => 'Rendimento real de 6% ao ano (acima da inflação). A partir de certo ponto, os juros rendem mais do que você aporta.',
    montar: (el) => {
      const total = projetar(0, 500, 6, 30);
      linhas(el, {
        rotulosX: anos(30),
        nomeX: 'Ano',
        fmt: (n) => brl(n),
        fmtEixo: brlCurto,
        series: [
          { nome: 'Com juros compostos', cor: 'var(--s1)', pontos: total },
          { nome: 'Total que você aportou', cor: 'var(--s2)', pontos: total.map((_, i) => i * 6000) },
        ],
      });
    },
  },
  inflacao: {
    titulo: 'O que acontece com R$ 10.000 em 20 anos',
    legenda: (m) => `Poder de compra com a inflação atual (${pct(m.ipca)} ao ano) contra o mesmo valor investido a ${pct(m.selic)} ao ano, já descontados IR de 15% e a inflação.`,
    montar: (el, m) => {
      const real = ((1 + (m.selic * 0.85) / 100) / (1 + m.ipca / 100) - 1) * 100;
      linhas(el, {
        rotulosX: anos(20),
        nomeX: 'Ano',
        fmt: (n) => brl(n),
        fmtEixo: brlCurto,
        series: [
          { nome: 'Investido na Selic (valor real)', cor: 'var(--s1)', pontos: projetar(10000, 0, real, 20) },
          { nome: 'Parado na conta (valor real)', cor: 'var(--s2)', pontos: anos(20).map((_, i) => 10000 / Math.pow(1 + m.ipca / 100, i)) },
        ],
      });
    },
  },
  indicadores: {
    titulo: 'Os indicadores hoje, em % ao ano',
    legenda: () => 'Juro real é o quanto a Selic rende acima da inflação.',
    montar: (el, m, poupanca) => {
      barras(el, {
        fmt: (n) => pct(n),
        itens: [
          { rotulo: 'Selic', nota: 'taxa básica', valor: m.selic },
          { rotulo: 'CDI', nota: 'referência da renda fixa', valor: m.cdi },
          { rotulo: 'Juro real', nota: 'Selic acima da inflação', valor: ((1 + m.selic / 100) / (1 + m.ipca / 100) - 1) * 100 },
          { rotulo: 'Poupança', nota: 'aproximado', valor: poupanca },
          { rotulo: 'IPCA', nota: 'inflação em 12 meses', valor: m.ipca },
        ],
      });
    },
  },
  rendafixa: {
    titulo: 'Rendimento líquido em 1 ano, em %',
    legenda: () => 'Já descontado o IR de 20% (prazo de 1 ano) onde ele existe. LCI, LCA e poupança são isentas.',
    montar: (el, m, poupanca) => barras(el, { fmt: (n) => pct(n), itens: comparativoRendaFixa(m, poupanca) }),
  },
  ir: {
    titulo: 'IR da renda fixa: quanto mais tempo, menos imposto',
    legenda: (m) => `Alíquota sobre o rendimento. Em um CDB de 100% do CDI por 2 anos, o rendimento bruto de ${pct(rendimentoNoPrazo(m.cdi, 730), 1)} vira ${pct(rendimentoNoPrazo(m.cdi, 730) * 0.825, 1)} líquido.`,
    montar: (el) =>
      barras(el, {
        fmt: (n) => pct(n, 1),
        cor: 'var(--s2)',
        itens: [
          { rotulo: 'Até 180 dias', valor: 22.5 },
          { rotulo: '181 a 360 dias', valor: 20 },
          { rotulo: '361 a 720 dias', valor: 17.5 },
          { rotulo: 'Acima de 720 dias', valor: 15 },
        ],
      }),
  },
  alocacao: {
    titulo: 'Exemplos de alocação por perfil',
    legenda: () => 'Referências didáticas, não recomendações. A reserva de emergência fica fora desta conta.',
    montar: (el) =>
      empilhadas(el, {
        partes: [
          { nome: 'Renda fixa pós-fixada', cor: 'var(--s1)' },
          { nome: 'Renda fixa IPCA+ e prefixada', cor: 'var(--s2)' },
          { nome: 'FIIs', cor: 'var(--s3)' },
          { nome: 'Ações Brasil', cor: 'var(--s4)' },
          { nome: 'Exterior', cor: 'var(--s5)' },
        ],
        linhas: [
          { rotulo: 'Conservador', valores: [60, 30, 5, 5, 0] },
          { rotulo: 'Moderado', valores: [35, 30, 10, 15, 10] },
          { rotulo: 'Arrojado', valores: [15, 25, 15, 25, 20] },
        ],
      }),
  },
  quedas: {
    titulo: 'Maiores quedas já vistas, do topo ao fundo',
    legenda: () => 'Ordens de grandeza históricas aproximadas. Servem para dimensionar quanto de cada classe você aguenta ter.',
    montar: (el) =>
      barras(el, {
        fmt: (n) => '−' + pct(n, 0),
        cor: 'var(--s8)',
        itens: [
          { rotulo: 'Bitcoin', nota: '2021–2022', valor: 77 },
          { rotulo: 'Ibovespa', nota: 'crise de 2008', valor: 60 },
          { rotulo: 'Ibovespa', nota: 'pandemia, 2020', valor: 46 },
          { rotulo: 'IFIX (FIIs)', nota: 'pandemia, 2020', valor: 36 },
          { rotulo: 'Tesouro IPCA+ longo', nota: 'alta de juros', valor: 30 },
          { rotulo: 'Tesouro Selic', nota: 'praticamente não cai', valor: 0.3 },
        ],
      }),
  },
  regra4: {
    titulo: 'Anos até a independência financeira',
    legenda: () => 'Partindo do zero, com rendimento real de 5% ao ano e alvo de 25 vezes o gasto anual. Depende só da fatia da renda que você poupa.',
    montar: (el) =>
      barras(el, {
        fmt: (n) => n.toFixed(0) + ' anos',
        cor: 'var(--s3)',
        itens: [10, 20, 30, 40, 50, 60].map((p) => {
          const alvo = 25 * (100 - p) * 12;
          let saldo = 0, m = 0;
          const tm = Math.pow(1.05, 1 / 12) - 1;
          while (saldo < alvo && m < 1200) { saldo = saldo * (1 + tm) + p; m++; }
          return { rotulo: `Poupando ${p}% da renda`, valor: m / 12 };
        }),
      }),
  },
};
