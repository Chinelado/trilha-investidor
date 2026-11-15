import * as cofre from './cofre';
import { MERCADO } from '../data/mercado';

export interface Sessao {
  data: string; // ISO
  tipo: 'licao' | 'diario';
  ref: string;
  titulo: string;
  nota?: number; // 0–100
  minutos: number;
}

export interface Estado {
  v: 1;
  criadoEm: string;
  atualizadoEm: string;
  inicioTrilha: string; // AAAA-MM-DD
  ritmoLivre: boolean;
  perfil: { renda: number; despesas: number; investido: number; reserva: number; aporte: number };
  licoes: Record<string, { concluidaEm?: string; nota?: number; tentativas: number; missao?: boolean; anotacao?: string }>;
  sessoes: Sessao[];
  diario: Record<string, { acertos: number; total: number }>;
  patrimonio: { mes: string; valor: number }[];
  mercado: null | { selic: number; cdi: number; ipca: number; dolar: number; em: string };
  carteira: {
    itens: { id: string; nome: string; classe: string; valor: number; emissor?: string }[];
    modelo: string; // conservador | moderado | arrojado | personalizado
    alvo: Record<string, number>; // % por classe da carteira de longo prazo
    mesesReserva: number;
  };
  backupEm?: string;
  perfilRisco: { respostas: Record<string, number>; em?: string };
}

export function hoje(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function estadoInicial(): Estado {
  const agora = new Date().toISOString();
  return {
    v: 1,
    criadoEm: agora,
    atualizadoEm: agora,
    inicioTrilha: hoje(),
    ritmoLivre: false,
    perfil: { renda: 0, despesas: 0, investido: 0, reserva: 0, aporte: 0 },
    licoes: {},
    sessoes: [],
    diario: {},
    patrimonio: [],
    mercado: null,
    carteira: { itens: [], modelo: 'moderado', alvo: {}, mesesReserva: 6 },
    perfilRisco: { respostas: {} },
  };
}

let estado: Estado | null = null;
const filas: ((e: Estado) => void)[] = [];

export function definir(e: Estado) {
  const base = estadoInicial();
  estado = { ...base, ...e, perfil: { ...base.perfil, ...(e.perfil || {}) }, carteira: { ...base.carteira, ...(e.carteira || {}) } };
  document.body.classList.add('aberto');
  filas.splice(0).forEach((f) => f(estado!));
}

/** Executa o callback quando o cofre estiver aberto (imediatamente, se já estiver). */
export function aoAbrir(f: (e: Estado) => void) {
  if (estado) f(estado);
  else filas.push(f);
}

export function obter(): Estado {
  if (!estado) throw new Error('Cofre trancado');
  return estado;
}

export async function atualizar(f: (e: Estado) => void): Promise<Estado> {
  const e = obter();
  f(e);
  e.atualizadoEm = new Date().toISOString();
  await cofre.salvar(e);
  return e;
}

// ---------- Derivados ----------

/** Semana atual da trilha (1 = primeira semana). */
export function semanaAtual(e: Estado): number {
  const inicio = new Date(e.inicioTrilha + 'T00:00:00');
  const dias = Math.floor((Date.now() - inicio.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(dias / 7) + 1);
}

export function dataLiberacao(e: Estado, semana: number): Date {
  const d = new Date(e.inicioTrilha + 'T00:00:00');
  d.setDate(d.getDate() + (semana - 1) * 7);
  return d;
}

export function liberada(e: Estado, semana: number): boolean {
  return e.ritmoLivre || semana <= semanaAtual(e);
}

/** Dias seguidos com alguma atividade de estudo, contando até hoje (ou ontem). */
export function sequencia(e: Estado): number {
  const dias = new Set<string>([...Object.keys(e.diario), ...e.sessoes.map((s) => hoje(new Date(s.data)))]);
  const d = new Date();
  if (!dias.has(hoje(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(hoje(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function notaMedia(e: Estado): number | null {
  const notas = Object.values(e.licoes)
    .filter((l) => l.concluidaEm && typeof l.nota === 'number')
    .map((l) => l.nota!);
  return notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null;
}

/** Indicadores em uso: os atualizados pelo usuário (via Banco Central) ou os validados no build. */
export function mercadoAtual(e?: Estado | null) {
  const m = e?.mercado;
  if (m && m.em > MERCADO.validadoEm) return { selic: m.selic, cdi: m.cdi, ipca: m.ipca, dolar: m.dolar, em: m.em, origem: 'Banco Central' };
  return { selic: MERCADO.selic, cdi: MERCADO.cdi, ipca: MERCADO.ipca12m, dolar: MERCADO.dolar, em: MERCADO.validadoEm, origem: 'validação do conteúdo' };
}
