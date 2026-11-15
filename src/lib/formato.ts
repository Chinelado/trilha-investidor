export const brl = (n: number, casas = 0) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: casas, maximumFractionDigits: casas });

export const pct = (n: number, casas = 2) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) + '%';

export const num = (n: number, casas = 0) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

export const brlCurto = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e6) return 'R$ ' + num(n / 1e6, a >= 1e7 ? 0 : 1) + ' mi';
  if (a >= 1e3) return 'R$ ' + num(n / 1e3, a < 1e4 && a % 1000 ? 1 : 0) + ' mil';
  return 'R$ ' + num(n, 0);
};

export const dataBR = (iso: string | Date) =>
  (typeof iso === 'string' ? new Date(iso.length === 10 ? iso + 'T00:00:00' : iso) : iso).toLocaleDateString('pt-BR');

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Alíquota de IR da renda fixa (tabela regressiva) pelo prazo em dias. */
export function aliquotaIR(dias: number): number {
  if (dias <= 180) return 22.5;
  if (dias <= 360) return 20;
  if (dias <= 720) return 17.5;
  return 15;
}

/** Rendimento bruto (%) de uma taxa anual em um prazo em dias corridos. */
export function rendimentoNoPrazo(taxaAnual: number, dias: number): number {
  return (Math.pow(1 + taxaAnual / 100, dias / 365) - 1) * 100;
}

/** Evolução mês a mês de um investimento com aportes mensais. Retorna o saldo ao fim de cada ano (índice 0 = hoje). */
export function projetar(inicial: number, aporteMensal: number, taxaAnual: number, anos: number): number[] {
  const tm = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
  const out = [inicial];
  let saldo = inicial;
  for (let m = 1; m <= anos * 12; m++) {
    saldo = saldo * (1 + tm) + aporteMensal;
    if (m % 12 === 0) out.push(saldo);
  }
  return out;
}

/** Meses até atingir um alvo com aportes e juros (null se passar de 100 anos). */
export function mesesAte(alvo: number, inicial: number, aporteMensal: number, taxaAnual: number): number | null {
  if (inicial >= alvo) return 0;
  const tm = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
  let saldo = inicial;
  for (let m = 1; m <= 1200; m++) {
    saldo = saldo * (1 + tm) + aporteMensal;
    if (saldo >= alvo) return m;
  }
  return null;
}

export function duracao(meses: number | null): string {
  if (meses === null) return 'mais de 100 anos';
  if (meses === 0) return 'já atingido';
  const a = Math.floor(meses / 12);
  const m = meses % 12;
  const pa = a ? `${a} ano${a > 1 ? 's' : ''}` : '';
  const pm = m ? `${m} ${m > 1 ? 'meses' : 'mês'}` : '';
  return [pa, pm].filter(Boolean).join(' e ');
}
