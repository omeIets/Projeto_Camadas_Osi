import { SignJWT, decodeJwt } from 'https://cdn.jsdelivr.net/npm/jose@6/+esm';
import { camadaSessao }     from './sessao.js';
import { camadaTransporte } from './transporte.js';
import { camadaEnlace }     from './enlace.js';
import { camadaFisica }     from './fisica.js';

// =====================
// JWT SECRET — apenas no código
// =====================
const SECRET = new TextEncoder().encode('chave-teste');

// =====================
// AES-GCM — Gera ou recupera chave do localStorage
// =====================
async function obterChaveAES() {
  const salva = localStorage.getItem('osi-aes-gcm-key');

  if (salva) {
    // Reimporta a chave salva em formato JWK
    const jwk = JSON.parse(salva);
    return await crypto.subtle.importKey(
      'jwk', jwk,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Gera nova chave AES-GCM 256-bit
  const chave = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // Exporta e persiste no localStorage
  const jwk = await crypto.subtle.exportKey('jwk', chave);
  localStorage.setItem('osi-aes-gcm-key', JSON.stringify(jwk));
  console.log('[AES-GCM] Nova chave gerada e salva no localStorage.');

  return chave;
}

// =====================
// AES-GCM — Encripta dados com cripto nativa
// =====================
async function encriptarAESGCM(dados) {
  const chave  = await obterChaveAES();
  const iv     = crypto.getRandomValues(new Uint8Array(12)); // IV aleatório de 96 bits
  const texto  = new TextEncoder().encode(JSON.stringify(dados));

  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    chave,
    texto
  );

  // Converte para Base64 para armazenamento/transmissão
  const ivB64     = btoa(String.fromCharCode(...iv));
  const dadosB64  = btoa(String.fromCharCode(...new Uint8Array(cifrado)));

  return {
    algoritmo: 'AES-GCM-256',
    iv:        ivB64,
    payload:   dadosB64,
    tamanho:   cifrado.byteLength,
  };
}

// =====================
// DNS Google — resolve o domínio do destinatário
// =====================
async function resolverDNS(dadosLimpos) {
  // Extrai o domínio conforme o tipo de dado
  let dominio = null;

  if (dadosLimpos.destinatario?.includes('@')) {
    dominio = dadosLimpos.destinatario.split('@')[1];
  } else if (dadosLimpos.host) {
    dominio = dadosLimpos.host
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
  }

  if (!dominio) return null;

  try {
    const res  = await fetch(`https://dns.google/resolve?name=${dominio}&type=A`);
    const json = await res.json();
    const ip   = json.Answer?.[0]?.data ?? null;
    console.log(`[DNS Google] ${dominio} → ${ip}`);
    return { dominio, ip, status: json.Status };
  } catch (e) {
    console.warn('[DNS Google] Falha:', e.message);
    return { dominio, ip: null, status: 'erro' };
  }
}

// =====================
// JWT — assina com HS256
// =====================
async function gerarTokenJWT(dadosEncriptados, protocolo) {
  const jwtPayload = {
    sessionId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    protocolo,
    dados:     dadosEncriptados, // payload contém o blob AES-GCM
  };

  const token = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(SECRET);

  return token;
}

// =====================
// CAMADA DE APRESENTAÇÃO
// =====================
export async function camadaApresentacao(dadosLimpos) {
  console.log('═══ CAMADA DE APRESENTAÇÃO ═══');

  // 1. Encripta os dados com AES-GCM (cripto nativa do browser)
  const dadosEncriptados = await encriptarAESGCM(dadosLimpos);
  console.log('[Apresentação] AES-GCM:', dadosEncriptados);

  // 2. Gera o token JWT com os dados encriptados no payload
  const token = await gerarTokenJWT(dadosEncriptados, dadosLimpos.protocolo);
  console.log('[Apresentação] JWT:', token);

  // 3. Decodifica o payload para inspeção
  const payload = decodeJwt(token);
  console.log('[Apresentação] Payload JWT:', payload);

  // 4. Resolve DNS via Google DNS (requisição HTTP)
  const dns = await resolverDNS(dadosLimpos);
  console.log('[Apresentação] DNS:', dns);


  // ══ CAMADA DE SESSÃO — recebe payload JWT ══
  const sessao = camadaSessao(payload, dns);


  // ══ CAMADA DE TRANSPORTE — estrutura do professor ══
  const transporte = camadaTransporte(sessao, dadosLimpos.protocolo);

  // ══ CAMADA DE ENLACE ══
  const quadro = camadaEnlace(transporte);

  // ══ CAMADA FÍSICA ══
  const bits = camadaFisica(quadro);

  // Salva tudo para a página de resultado
  localStorage.setItem('dadosCriptografados', JSON.stringify({
    token,
    payload,
    dadosEncriptados,
    dns,
    sessao,
    transporte,
    quadro,
    bits,
  }));

  window.location.href = 'resultado.html';
}
