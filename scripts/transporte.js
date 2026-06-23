/*
 * CAMADA DE TRANSPORTE — estrutura baseada no modelo do professor
 *
 * Mapeamento de portas (TCP):
 *   HTTP       → 80
 *   HTTPS      → 443
 *   SMTP/POP   → 587
 *   FTP/HTTP   → 21
 *   WEBSOCKET  → 80
 */

const MAPA_PORTAS = {
  'HTTP':      80,
  'HTTP/HTTPS': 443,
  'HTTPS':     443,
  'SMTP':      587,
  'SMTP/POP':  587,
  'FTP':       21,
  'FTP/HTTP':  21,
  'WEBSOCKET': 80,
  'WebSocket': 80,
};

export function camadaTransporte(sessao, protocolo = 'HTTP/HTTPS') {
  // Porta de destino conforme o protocolo detectado
  const portaDestino = MAPA_PORTAS[protocolo] ?? 80;

  // Porta de origem efêmera (49152–65535)
  const portaOrigem = Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;

  // Objeto de transporte conforme especificação do professor
  const transportObj = {
    sessionId:           sessao.sessionId,
    packetId:            crypto.randomUUID(),
    protocoloTransporte: 'TCP',
    portaOrigem,
    portaDestino,
    dados:               sessao,
  };

  console.log('═══ CAMADA DE TRANSPORTE ═══', transportObj);
  return transportObj;
}
