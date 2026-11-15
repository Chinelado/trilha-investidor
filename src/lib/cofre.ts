// Cofre local: cifra o estado do app com AES-256-GCM antes de gravar no localStorage.
// A chave é derivada da senha com PBKDF2-SHA256. A senha nunca é armazenada.

const META = 'ti.meta';
const DADOS = 'ti.dados';
const SESSAO = 'ti.sessao';
const ATIVIDADE = 'ti.atividade';
const ITERACOES = 600_000;
export const MINUTOS_BLOQUEIO = 15;

const enc = new TextEncoder();
const dec = new TextDecoder();

let chave: CryptoKey | null = null;

function b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function deB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function criptoDisponivel(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle;
}

async function derivar(senha: string, sal: Uint8Array, iter: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', enc.encode(senha), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sal, iterations: iter, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
}

async function cifrar(k: CryptoKey, obj: unknown): Promise<{ iv: string; ct: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, enc.encode(JSON.stringify(obj)));
  return { iv: b64(iv), ct: b64(ct) };
}

async function decifrar(k: CryptoKey, pacote: { iv: string; ct: string }): Promise<any> {
  const claro = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(pacote.iv) }, k, deB64(pacote.ct));
  return JSON.parse(dec.decode(claro));
}

async function guardarSessao(k: CryptoKey) {
  const bruta = await crypto.subtle.exportKey('raw', k);
  sessionStorage.setItem(SESSAO, b64(bruta));
  marcarAtividade();
}

export function marcarAtividade() {
  sessionStorage.setItem(ATIVIDADE, String(Date.now()));
}

export function existeCofre(): boolean {
  return !!localStorage.getItem(META) && !!localStorage.getItem(DADOS);
}

export function estaAberto(): boolean {
  return chave !== null;
}

export async function criar(senha: string, estado: unknown): Promise<void> {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const k = await derivar(senha, sal, ITERACOES);
  localStorage.setItem(META, JSON.stringify({ v: 1, sal: b64(sal), iter: ITERACOES }));
  localStorage.setItem(DADOS, JSON.stringify(await cifrar(k, estado)));
  chave = k;
  await guardarSessao(k);
}

/** Abre o cofre com a senha. Lança erro se a senha estiver errada. */
export async function abrir(senha: string): Promise<any> {
  const meta = JSON.parse(localStorage.getItem(META)!);
  const k = await derivar(senha, deB64(meta.sal), meta.iter);
  const estado = await decifrar(k, JSON.parse(localStorage.getItem(DADOS)!));
  chave = k;
  await guardarSessao(k);
  return estado;
}

/** Reabre o cofre a partir da chave guardada na sessão da aba (ao navegar entre páginas). */
export async function restaurarSessao(): Promise<any | null> {
  const bruta = sessionStorage.getItem(SESSAO);
  if (!bruta || !existeCofre()) return null;
  const ultima = Number(sessionStorage.getItem(ATIVIDADE) || 0);
  if (Date.now() - ultima > MINUTOS_BLOQUEIO * 60_000) {
    trancar();
    return null;
  }
  try {
    const k = await crypto.subtle.importKey('raw', deB64(bruta), 'AES-GCM', true, ['encrypt', 'decrypt']);
    const estado = await decifrar(k, JSON.parse(localStorage.getItem(DADOS)!));
    chave = k;
    marcarAtividade();
    return estado;
  } catch {
    trancar();
    return null;
  }
}

export async function salvar(estado: unknown): Promise<void> {
  if (!chave) throw new Error('Cofre trancado');
  localStorage.setItem(DADOS, JSON.stringify(await cifrar(chave, estado)));
  marcarAtividade();
}

export function trancar() {
  chave = null;
  sessionStorage.removeItem(SESSAO);
  sessionStorage.removeItem(ATIVIDADE);
}

export async function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  const estado = await abrir(senhaAtual);
  await criar(novaSenha, estado);
}

/** Conteúdo do arquivo de backup: os mesmos dados cifrados, protegidos pela mesma senha. */
export function exportar(): string {
  return JSON.stringify({
    app: 'trilha-investidor',
    exportadoEm: new Date().toISOString(),
    meta: JSON.parse(localStorage.getItem(META)!),
    dados: JSON.parse(localStorage.getItem(DADOS)!),
  });
}

/** Decifra um arquivo de backup com a senha usada quando ele foi exportado. */
export async function lerBackup(texto: string, senha: string): Promise<any> {
  const arq = JSON.parse(texto);
  if (arq.app !== 'trilha-investidor' || !arq.meta || !arq.dados) throw new Error('Arquivo inválido');
  const k = await derivar(senha, deB64(arq.meta.sal), arq.meta.iter);
  return decifrar(k, arq.dados);
}

export function apagarTudo() {
  trancar();
  localStorage.removeItem(META);
  localStorage.removeItem(DADOS);
}
