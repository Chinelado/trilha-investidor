import type { Risco } from './mercado';
import { LICOES_A } from './licoes-a';
import { LICOES_B } from './licoes-b';

export interface Pergunta {
  p: string;
  ops: string[];
  c: number; // índice da opção correta
  e: string; // explicação
}

export interface Licao {
  semana: number;
  slug: string;
  modulo: number;
  titulo: string;
  resumo: string;
  risco: Risco | null; // classificação do tipo de ativo tratado (null = conceitual)
  minutos: number;
  objetivos: string[];
  secoes: { h: string; html: string }[];
  visual?: string;
  aprendizados: string[];
  missao: string;
  quiz: Pergunta[];
}

export const MODULOS = [
  { n: 1, nome: 'Fundamentos', desc: 'Organizar a casa e entender as forças que movem o dinheiro.' },
  { n: 2, nome: 'Renda fixa', desc: 'A base segura de qualquer carteira.' },
  { n: 3, nome: 'Estratégia', desc: 'Risco, perfil, alocação e autocontrole.' },
  { n: 4, nome: 'Renda variável', desc: 'Ações, FIIs e ETFs para o longo prazo.' },
  { n: 5, nome: 'Além do básico', desc: 'Exterior, previdência, alternativos e o que evitar.' },
  { n: 6, nome: 'Plano de vida', desc: 'Rotina, rebalanceamento e independência financeira.' },
];

export const LICOES: Licao[] = [...LICOES_A, ...LICOES_B];
export const NOTA_MINIMA = 70;
