/**
 * CAMADA DE ENLACE — Quadro Ethernet
 *
 * Estrutura do quadro baseada no padrão IEEE 802.3:
 *   macOrigem   - 6 bytes (gerado a partir do sessionId)
 *   macDestino  - 6 bytes (gerado a partir do packetId)
 *   etherType   - 0x0800 = IPv4
 *   dados       - payload encapsulado (objeto de transporte)
 *   tamanho     - tamanho estimado do quadro em bytes
 *   fcs         - Frame Check Sequence (CRC-32 simulado)
 */

/**
 * Deriva um endereço MAC de 6 bytes a partir de uma string UUID.
 * Usa os primeiros 12 hex chars do UUID, ajustando o bit U/L.
 */
function uuidParaMAC(uuid) {
  const hex = uuid.replace(/-/g, '').slice(0, 12).toUpperCase();
  const bytes = hex.match(/.{2}/g);
  // Bit 1 do primeiro byte = 0 → MAC unicast (administrado localmente)
  const primeiroByte = (parseInt(bytes[0], 16) & 0xFE).toString(16).padStart(2, '0').toUpperCase();
  bytes[0] = primeiroByte;
  return bytes.join(':');
}

/**
 * Gera um FCS (Frame Check Sequence) simulado de 32 bits.
 * Representa o CRC-32 do quadro Ethernet.
 */
function gerarFCS(dados) {
  const str = JSON.stringify(dados);
  let crc   = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1;
    }
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

export function camadaEnlace(transporte) {
  // MACs derivados dos IDs únicos da sessão para serem dinâmicos e rastreáveis
  const macOrigem  = uuidParaMAC(transporte.sessionId);
  const macDestino = uuidParaMAC(transporte.packetId);

  // Tamanho estimado do quadro: header Ethernet (14B) + dados + FCS (4B)
  const payloadStr    = JSON.stringify(transporte);
  const tamanhoQuadro = 14 + payloadStr.length + 4;

  const quadro = {
    macOrigem,
    macDestino,
    etherType:    '0x0800',          // IPv4
    dados:        transporte,
    tamanhoQuadro,                   // em bytes (estimado)
    fcs:          gerarFCS(transporte), // CRC-32 simulado
  };

  console.log('═══ CAMADA DE ENLACE ═══', quadro);
  return quadro;
}
