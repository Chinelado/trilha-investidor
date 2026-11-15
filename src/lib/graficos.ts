// Gráficos próprios (SVG/HTML), sem biblioteca externa.
// Cores vêm das variáveis CSS --s1..--s8 (paleta validada para daltonismo, claro e escuro).
import { esc } from './formato';

export interface Serie {
  nome: string;
  cor: string; // ex.: 'var(--s1)'
  pontos: number[];
  tracejada?: boolean;
}

function legenda(itens: { nome: string; cor: string }[]): string {
  if (itens.length < 2) return '';
  return `<div class="g-legenda">${itens
    .map((i) => `<span><i style="background:${i.cor}"></i>${esc(i.nome)}</span>`)
    .join('')}</div>`;
}

function tabela(cab: string[], linhas: string[][]): string {
  return `<details class="g-tabela"><summary>Ver dados em tabela</summary><div class="rolagem"><table><thead><tr>${cab
    .map((c) => `<th>${esc(c)}</th>`)
    .join('')}</tr></thead><tbody>${linhas
    .map((l) => `<tr>${l.map((c, i) => (i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`)).join('')}</tr>`)
    .join('')}</tbody></table></div></details>`;
}

function teto(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * p;
}

/** Gráfico de linhas com mira e dica ao passar o cursor/dedo. */
export function linhas(
  el: HTMLElement,
  o: { rotulosX: string[]; series: Serie[]; fmt: (n: number) => string; fmtEixo?: (n: number) => string; nomeX?: string },
) {
  // A área de desenho acompanha a largura disponível, para o texto dos eixos não encolher no celular.
  const W = Math.round(Math.max(300, Math.min(720, el.clientWidth || 640)));
  const H = W < 480 ? 230 : 300, L = 62, R = 14, T = 12, B = 30;
  const n = o.rotulosX.length;
  const max = teto(Math.max(...o.series.flatMap((s) => s.pontos)));
  const x = (i: number) => L + (n > 1 ? (i / (n - 1)) * (W - L - R) : 0);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const fe = o.fmtEixo || o.fmt;

  let grade = '';
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    grade += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="${i ? 'g-grade' : 'g-base'}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="g-eixo">${esc(fe(v))}</text>`;
  }
  const passo = Math.max(1, Math.ceil(n / 6));
  let eixoX = '';
  // Rótulos a cada "passo", sempre incluindo o último (e pulando o que colidiria com ele).
  const marcasX: number[] = [];
  for (let i = 0; i < n - 1; i += passo) if (n - 1 - i >= passo / 2) marcasX.push(i);
  marcasX.push(n - 1);
  for (const i of marcasX) {
    const ancora = i === 0 && n > 1 ? 'start' : i === n - 1 ? 'end' : 'middle';
    eixoX += `<text x="${x(i)}" y="${H - 8}" text-anchor="${ancora}" class="g-eixo">${esc(o.rotulosX[i])}</text>`;
  }

  const caminhos = o.series
    .map(
      (s) =>
        `<path d="${s.pontos.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}" fill="none" stroke="${s.cor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${s.tracejada ? ' stroke-dasharray="5 4"' : ''}/>`,
    )
    .join('');
  const marcas = o.series.map((s) => `<circle r="4.5" fill="${s.cor}" class="g-ponto" stroke="var(--cartao)" stroke-width="2" visibility="hidden"/>`).join('');

  el.classList.add('grafico');
  el.innerHTML = `${legenda(o.series)}<div class="g-area"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de linhas: ${esc(o.series.map((s) => s.nome).join(', '))}">${grade}${eixoX}${caminhos}<line class="g-mira" y1="${T}" y2="${H - B}" visibility="hidden"/>${marcas}<rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" class="g-alvo"/></svg><div class="g-dica" hidden></div></div>${tabela(
    [o.nomeX || '', ...o.series.map((s) => s.nome)],
    o.rotulosX.map((r, i) => [r, ...o.series.map((s) => o.fmt(s.pontos[i]))]),
  )}`;

  const svg = el.querySelector('svg')!;
  const mira = el.querySelector<SVGLineElement>('.g-mira')!;
  const pontos = [...el.querySelectorAll<SVGCircleElement>('.g-ponto')];
  const dica = el.querySelector<HTMLElement>('.g-dica')!;
  const area = el.querySelector<HTMLElement>('.g-area')!;

  const mostrar = (ev: PointerEvent) => {
    const r = svg.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(((px - L) / (W - L - R)) * (n - 1))));
    mira.setAttribute('x1', String(x(i)));
    mira.setAttribute('x2', String(x(i)));
    mira.setAttribute('visibility', 'visible');
    pontos.forEach((p, k) => {
      p.setAttribute('cx', String(x(i)));
      p.setAttribute('cy', String(y(o.series[k].pontos[i])));
      p.setAttribute('visibility', 'visible');
    });
    dica.innerHTML = `<b>${esc(o.rotulosX[i])}</b>${o.series
      .map((s) => `<span><i style="background:${s.cor}"></i>${esc(s.nome)} <strong>${esc(o.fmt(s.pontos[i]))}</strong></span>`)
      .join('')}`;
    dica.hidden = false;
    const larg = area.clientWidth;
    const pos = (x(i) / W) * larg;
    dica.style.left = pos > larg / 2 ? '' : `${pos + 12}px`;
    dica.style.right = pos > larg / 2 ? `${larg - pos + 12}px` : '';
  };
  const ocultar = () => {
    mira.setAttribute('visibility', 'hidden');
    pontos.forEach((p) => p.setAttribute('visibility', 'hidden'));
    dica.hidden = true;
  };
  svg.addEventListener('pointermove', mostrar);
  svg.addEventListener('pointerdown', mostrar);
  svg.addEventListener('pointerleave', ocultar);
}

/** Barras horizontais com o valor escrito ao lado de cada barra. */
export function barras(
  el: HTMLElement,
  o: { itens: { rotulo: string; valor: number; nota?: string; destaque?: boolean }[]; fmt: (n: number) => string; cor?: string },
) {
  const max = Math.max(...o.itens.map((i) => i.valor), 0.0001);
  el.classList.add('grafico');
  el.innerHTML = `<div class="g-barras">${o.itens
    .map(
      (i) =>
        `<div class="g-linha" title="${esc(i.rotulo)}: ${esc(o.fmt(i.valor))}"><span class="g-rot">${esc(i.rotulo)}${i.nota ? `<small>${esc(i.nota)}</small>` : ''}</span><span class="g-trilho"><span class="g-barra" style="width:${Math.max(1, (i.valor / max) * 100).toFixed(1)}%;background:${i.destaque === false ? 'var(--s-neutro)' : o.cor || 'var(--s1)'}"></span></span><span class="g-val">${esc(o.fmt(i.valor))}</span></div>`,
    )
    .join('')}</div>`;
}

/** Barras empilhadas a 100% (uma por linha), com legenda. */
export function empilhadas(
  el: HTMLElement,
  o: { partes: { nome: string; cor: string }[]; linhas: { rotulo: string; valores: number[] }[] },
) {
  el.classList.add('grafico');
  el.innerHTML = `${legenda(o.partes)}<div class="g-barras">${o.linhas
    .map(
      (l) =>
        `<div class="g-linha g-emp"><span class="g-rot">${esc(l.rotulo)}</span><span class="g-pilha">${l.valores
          .map((v, i) =>
            v > 0
              ? `<span style="flex:${v};background:${o.partes[i].cor}" title="${esc(o.partes[i].nome)}: ${v}%">${v >= 10 ? v + '%' : ''}</span>`
              : '',
          )
          .join('')}</span></div>`,
    )
    .join('')}</div>${tabela(
    ['Perfil', ...o.partes.map((p) => p.nome)],
    o.linhas.map((l) => [l.rotulo, ...l.valores.map((v) => v + '%')]),
  )}`;
}
