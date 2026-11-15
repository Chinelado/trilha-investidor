// Perfil de investidor: combina o que a pessoa declara (questionário) com o que o sistema observa
// (reserva, taxa de poupança, progresso na trilha, carteira cadastrada).
// Segue a lógica usual de suitability: o perfil final é o MENOR entre tolerância, capacidade e conhecimento.
// É um modelo didático; não substitui o questionário da sua corretora nem um profissional certificado.
import type { Estado } from './estado';
import { LICOES } from '../data/licoes';
import { brl } from './formato';

export const PERGUNTAS: { id: string; eixo: 'tolerancia' | 'capacidade' | 'conhecimento'; p: string; ops: string[] }[] = [
  { id: 'prazo', eixo: 'capacidade', p: 'Quando você pretende usar a maior parte do dinheiro investido (fora a reserva)?', ops: ['Em menos de 2 anos', 'Entre 2 e 5 anos', 'Entre 5 e 10 anos', 'Daqui a mais de 10 anos'] },
  { id: 'objetivo', eixo: 'tolerancia', p: 'Qual frase descreve melhor o seu objetivo?', ops: ['Não perder dinheiro, mesmo rendendo pouco', 'Ganhar da inflação com pouca oscilação', 'Fazer o patrimônio crescer, aceitando oscilações', 'Buscar o maior crescimento possível, aceitando quedas fortes'] },
  { id: 'queda', eixo: 'tolerancia', p: 'Seus investimentos de risco caem 20% em três meses. O que você faz?', ops: ['Vendo tudo para não perder mais', 'Vendo uma parte', 'Mantenho e espero', 'Mantenho e aproveito para aportar mais'] },
  { id: 'perda', eixo: 'tolerancia', p: 'Qual a maior perda em um ano que você aceitaria ver sem mudar o plano?', ops: ['Nenhuma', 'Até 5%', 'Até 15%', 'Mais de 25%'] },
  { id: 'renda', eixo: 'capacidade', p: 'Como é a sua renda?', ops: ['Instável, com meses sem receber', 'Variável, mas recorrente', 'Estável (salário fixo)', 'Estável e com mais de uma fonte'] },
  { id: 'experiencia', eixo: 'conhecimento', p: 'Qual a sua experiência com investimentos?', ops: ['Só poupança ou conta', 'Renda fixa (Tesouro, CDB, LCI)', 'Fundos, FIIs ou ações há menos de 2 anos', 'Renda variável há mais de 2 anos, já passei por quedas'] },
];

export const NIVEIS = [
  { id: 'conservador', nome: 'Conservador', desc: 'Prioriza preservar o que tem. Aceita render menos para quase não ver o saldo cair.' },
  { id: 'moderado', nome: 'Moderado', desc: 'Aceita alguma oscilação em parte da carteira em troca de retorno maior no longo prazo.' },
  { id: 'arrojado', nome: 'Arrojado', desc: 'Tolera quedas fortes no curto prazo em busca de crescimento no longo prazo.' },
] as const;

export interface Eixo { id: string; nome: string; pontos: number; max: number; nivel: number; fatores: string[] }
export interface ResultadoPerfil {
  completo: boolean; // respondeu todo o questionário
  nivel: number; // 0, 1 ou 2
  eixos: Eixo[];
  limitantes: Eixo[]; // eixos que seguram o perfil no nível atual (vazio se já é arrojado)
  comoSubir: string[];
  revelado: { nivel: number; pctRisco: number } | null; // como a carteira atual se comporta
  divergencia: string | null;
}

const faixa = (pontos: number, cortes: [number, number]) => (pontos <= cortes[0] ? 0 : pontos <= cortes[1] ? 1 : 2);

export function calcularPerfil(e: Estado): ResultadoPerfil {
  const r = e.perfilRisco?.respostas || {};
  const completo = PERGUNTAS.every((q) => typeof r[q.id] === 'number');
  const v = (id: string) => r[id] ?? 0;

  // Tolerância: o que a pessoa declara aguentar (0–9)
  const tPts = v('objetivo') + v('queda') + v('perda');
  const tolerancia: Eixo = {
    id: 'tolerancia', nome: 'Tolerância a risco', pontos: tPts, max: 9, nivel: faixa(tPts, [3, 6]),
    fatores: ['Suas respostas sobre objetivo, reação a quedas e perda máxima aceitável.'],
  };

  // Capacidade: o que a situação financeira permite (0–12)
  const fat: string[] = [];
  const despesas = e.perfil.despesas;
  const caixa = e.carteira.itens.length ? e.carteira.itens.filter((i) => i.classe === 'caixa').reduce((s, i) => s + i.valor, 0) : e.perfil.reserva;
  const meses = despesas ? caixa / despesas : 0;
  const resPts = !despesas ? 0 : meses >= 6 ? 3 : meses >= 3 ? 2 : meses >= 1 ? 1 : 0;
  fat.push(!despesas ? 'Reserva de emergência: não calculada (informe despesas em Metas).' : `Reserva de emergência: ${brl(caixa)}, cerca de ${meses.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${meses >= 2 ? 'meses' : 'mês'} de despesas.`);
  const taxa = e.perfil.renda ? e.perfil.aporte / e.perfil.renda : 0;
  const poupPts = taxa >= 0.2 ? 3 : taxa >= 0.1 ? 2 : taxa > 0 ? 1 : 0;
  fat.push(e.perfil.renda ? `Taxa de poupança: ${(taxa * 100).toFixed(0)}% da renda.` : 'Taxa de poupança: não informada.');
  fat.push(`Prazo do dinheiro: "${PERGUNTAS[0].ops[v('prazo')]}".`);
  fat.push(`Renda: "${PERGUNTAS[4].ops[v('renda')]}".`);
  const cPts = v('prazo') + v('renda') + resPts + poupPts;
  let cNivel = faixa(cPts, [4, 8]);
  if (v('prazo') === 0) cNivel = 0; // dinheiro de curto prazo não comporta oscilação
  if (despesas && meses < 3) cNivel = Math.min(cNivel, 1); // sem reserva mínima, nada de perfil arrojado
  const capacidade: Eixo = { id: 'capacidade', nome: 'Capacidade financeira', pontos: cPts, max: 12, nivel: cNivel, fatores: fat };

  // Conhecimento: o maior entre a experiência declarada e o que a trilha comprova (0–3)
  const feitas = LICOES.filter((l) => e.licoes[l.slug]?.concluidaEm);
  const notas = feitas.map((l) => e.licoes[l.slug].nota || 0);
  const media = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
  const trilha = feitas.length >= 18 ? 3 : feitas.length >= 12 ? 2 : feitas.length >= 4 ? 1 : 0;
  const kPts = Math.max(v('experiencia'), trilha);
  const conhecimento: Eixo = {
    id: 'conhecimento', nome: 'Conhecimento', pontos: kPts, max: 3, nivel: Math.min(2, kPts === 0 ? 0 : kPts === 1 ? 1 : 2),
    fatores: [`Experiência declarada: "${PERGUNTAS[5].ops[v('experiencia')]}".`, `Trilha: ${feitas.length} de ${LICOES.length} lições concluídas${notas.length ? `, nota média de ${media}%` : ''}.`],
  };

  const eixos = [tolerancia, capacidade, conhecimento];
  const nivel = Math.min(...eixos.map((x) => x.nivel));
  const limitantes = nivel < 2 ? eixos.filter((x) => x.nivel === nivel) : [];

  const comoSubir: string[] = [];
  for (const lim of limitantes) {
    if (lim.id === 'capacidade') {
      if (despesas && meses < 6) comoSubir.push(`Completar a reserva de emergência de 6 meses (${brl(despesas * 6)}).`);
      if (taxa < 0.2 && e.perfil.renda) comoSubir.push(`Elevar o aporte para 20% da renda (${brl(e.perfil.renda * 0.2)} por mês).`);
      if (v('prazo') <= 1) comoSubir.push('Separar o dinheiro de curto prazo: só a parcela que pode ficar 5 anos ou mais comporta risco.');
      if (!despesas) comoSubir.push('Informar renda, despesas e aporte em Metas.');
    } else if (lim.id === 'conhecimento') {
      comoSubir.push(kPts === 0 ? 'Concluir o módulo 1 da trilha (4 lições).' : 'Concluir os módulos 2 e 3 da trilha (até a lição 12).');
    } else {
      comoSubir.push('Tolerância não se força. Ela muda com a experiência: refaça o questionário depois de viver uma queda de mercado com dinheiro investido.');
    }
  }

  // Perfil revelado: como a carteira cadastrada se comporta hoje
  let revelado: ResultadoPerfil['revelado'] = null;
  let divergencia: string | null = null;
  const total = e.carteira.itens.reduce((s, i) => s + i.valor, 0);
  if (total > 0) {
    const reserva = Math.min(despesas * e.carteira.mesesReserva, total);
    const longo = total - reserva;
    const soma = (cls: string[]) => e.carteira.itens.filter((i) => cls.includes(i.classe)).reduce((s, i) => s + i.valor, 0);
    const pctRisco = longo > 0 ? ((soma(['acoes', 'exterior', 'alt']) + soma(['fii']) * 0.6) / longo) * 100 : 0;
    revelado = { nivel: pctRisco < 15 ? 0 : pctRisco <= 45 ? 1 : 2, pctRisco: Math.min(100, pctRisco) };
    if (completo) {
      if (revelado.nivel > nivel) divergencia = `Sua carteira está mais arriscada do que o seu perfil: ela se comporta como a de um perfil ${NIVEIS[revelado.nivel].nome.toLowerCase()}, e o seu perfil calculado é ${NIVEIS[nivel].nome.toLowerCase()}. Em uma queda de mercado, a chance de você vender no pior momento é maior.`;
      else if (revelado.nivel < nivel) divergencia = `Sua carteira está mais conservadora do que o seu perfil permite. Não há problema nisso; significa apenas que há espaço para mais risco, se e quando você quiser, de forma gradual.`;
    }
  }

  return { completo, nivel, eixos, limitantes, comoSubir, revelado, divergencia };
}
