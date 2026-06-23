import { network, routerMap, dijkstra } from './network.js';
import { drawNetwork, drawRoute, animatePacket } from './animation.js';

// =========================
// CARREGA DADOS DO localStorage
// =========================
const resultado      = JSON.parse(localStorage.getItem('dadosCriptografados'));
const containerDados = document.querySelector('#dados-conteudo');

if (!resultado || !containerDados) {
  if (containerDados) {
    containerDados.innerHTML = '<p>Nenhum dado encontrado. Volte e faça uma requisição.</p>';
  }
} else {

  containerDados.innerHTML = '';

  // Helper: cria e appenda uma seção com título e HTML interno
  function secao(titulo, conteudoHTML) {
    const h3  = document.createElement('h3');
    h3.textContent = titulo;
    containerDados.appendChild(h3);
    const div = document.createElement('div');
    div.innerHTML = conteudoHTML;
    containerDados.appendChild(div);
  }

  // =========================
  // CAMADA DE APRESENTAÇÃO — AES-GCM
  // =========================
  if (resultado.dadosEncriptados) {
    const e = resultado.dadosEncriptados;
    secao('🔐 Camada de Apresentação — AES-GCM', `
      <p><strong>Algoritmo:</strong> ${e.algoritmo}</p>
      <p><strong>Tamanho cifrado:</strong> ${e.tamanho} bytes</p>
      <p><strong>IV (Base64):</strong> <code class="bits-preview">${e.iv}</code></p>
      <p><strong>Payload cifrado (prévia):</strong><br>
        <code class="bits-preview">${e.payload.slice(0, 80)}…</code>
      </p>
    `);
  }

  // =========================
  // TOKEN JWT
  // =========================
  secao('🔑 Token JWT (HS256)', `
    <span class="token-jwt">${resultado.token}</span>
  `);

  // =========================
  // PAYLOAD JWT
  // =========================
  if (resultado.payload) {
    const p = resultado.payload;
    secao('📦 Payload JWT', `
      <p><strong>sessionId:</strong> ${p.sessionId}</p>
      <p><strong>timestamp:</strong> ${p.timestamp}</p>
      <p><strong>protocolo:</strong> ${p.protocolo ?? '—'}</p>
      <p><strong>dados:</strong> encriptados com AES-GCM ↑</p>
    `);
  }

  // =========================
  // DNS GOOGLE
  // =========================
  if (resultado.dns) {
    const d = resultado.dns;
    secao('🌐 DNS Google (Requisição HTTP)', `
      <p><strong>Domínio consultado:</strong> ${d.dominio}</p>
      <p><strong>IP resolvido:</strong> ${d.ip ?? 'não resolvido'}</p>
      <p><strong>Status:</strong> ${d.status === 0 ? 'OK (NOERROR)' : (d.status ?? 'erro')}</p>
    `);
  }

  // =========================
  // CAMADA DE SESSÃO
  // =========================
  if (resultado.sessao) {
    const s = resultado.sessao;
    secao('🪪 Camada de Sessão', `
      <p><strong>Session ID (crypto.randomUUID):</strong> ${s.sessionId}</p>
      <p><strong>Início da Sessão:</strong> ${s.inicioSessao}</p>
    `);
  }

  // =========================
  // CAMADA DE TRANSPORTE (TCP)
  // =========================
  if (resultado.transporte) {
    const t = resultado.transporte;
    secao('📡 Camada de Transporte (TCP)', `
      <p><strong>Protocolo:</strong> ${t.protocoloTransporte}</p>
      <p><strong>Packet ID:</strong> ${t.packetId}</p>
      <p><strong>Session ID:</strong> ${t.sessionId}</p>
      <p><strong>Porta Origem:</strong> ${t.portaOrigem} <em>(efêmera)</em></p>
      <p><strong>Porta Destino:</strong> ${t.portaDestino}</p>
    `);
  }

  // =========================
  // CAMADA DE ENLACE (IEEE 802.3)
  // =========================
  if (resultado.quadro) {
    const q = resultado.quadro;
    secao('🔗 Camada de Enlace (Ethernet IEEE 802.3)', `
      <p><strong>MAC Origem:</strong> <code>${q.macOrigem}</code></p>
      <p><strong>MAC Destino:</strong> <code>${q.macDestino}</code></p>
      <p><strong>EtherType:</strong> ${q.etherType} <em>(IPv4)</em></p>
      <p><strong>Tamanho do Quadro:</strong> ${q.tamanhoQuadro} bytes</p>
      <p><strong>FCS (CRC-32):</strong> <code>${q.fcs}</code></p>
    `);
  }

  // =========================
  // CAMADA FÍSICA
  // =========================
  if (resultado.bits) {
    const preview = resultado.bits.split(' ').slice(0, 20).join(' ') + ' …';
    secao('⚡ Camada Física (Bits)', `
      <p><strong>Representação binária (prévia):</strong></p>
      <code class="bits-preview">${preview}</code>
    `);
  }

  // =========================
  // CAMADA DE REDE — Dijkstra contextual por protocolo
  //
  // Faz sentido para todos os três tipos de requisição?
  //   ✅ SIM — todo tráfego IP (SMTP, HTTP, WebSocket) é roteado na camada 3.
  //
  // O que MUDA entre os protocolos:
  //   • ORIGEM  → sempre R1 (gateway local da rede), igual para todos.
  //               Todo pacote sai pela mesma porta de saída da rede local.
  //   • DESTINO → determinístico baseado no IP real resolvido pelo DNS.
  //               Assim a mesma URL/email SEMPRE roteia para o MESMO roteador.
  //               Sem DNS (texto/WebSocket sem domínio): hash do protocolo.
  //   • DESCRIÇÃO → label semântico por protocolo (MTA, servidor web, etc.)
  // =========================
  const h3Rede = document.createElement('h3');
  h3Rede.textContent = '🗺 Camada de Rede — Dijkstra';
  containerDados.appendChild(h3Rede);

  const ativos = network.filter(r => r.ativo);

  if (ativos.length >= 2) {

    // ─── ORIGEM ──────────────────────────────────────────────
    // R1 = gateway local — fixo para todos os protocolos
    const origemId = 'R1';

    // ─── DESTINO — determinístico por contexto ────────────────
    const protocolo = resultado.payload?.protocolo ?? 'WEBSOCKET';
    const dnsIp     = resultado.dns?.ip ?? null;

    // Hash de IP → índice de roteador ativo
    function ipParaIndice(ip) {
      const oct  = ip.split('.').map(Number);
      const val  = (oct[2] ?? 0) * 256 + (oct[3] ?? 0);
      return val % ativos.length;
    }

    // Hash de string → índice de roteador ativo
    function strParaIndice(str) {
      let h = 0;
      for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xFFFF;
      return h % ativos.length;
    }

    let destinoIdx, resolucaoLabel;

    if (dnsIp) {
      destinoIdx    = ipParaIndice(dnsIp);
      resolucaoLabel = `DNS Google → ${resultado.dns.dominio} (${dnsIp})`;
    } else {
      destinoIdx    = strParaIndice(protocolo);
      resolucaoLabel = `Protocolo ${protocolo} — sem DNS (texto/WebSocket)`;
    }

    const possiveis = ativos.filter(r => r.id !== origemId);
    const destinoId = possiveis[destinoIdx % possiveis.length].id;

    // Label semântico por protocolo
    const labels = {
      'SMTP':       '📧 E-mail — MTA local → servidor MX do destinatário',
      'SMTP/POP':   '📧 E-mail — MTA local → servidor MX do destinatário',
      'HTTP/HTTPS': '🌐 Web — cliente → servidor web',
      'HTTPS':      '🌐 Web — cliente → servidor web',
      'WEBSOCKET':  '💬 Chat — cliente → servidor WebSocket',
      'FTP/HTTP':   '📁 Upload — cliente → servidor FTP',
    };
    const labelProtocolo = labels[protocolo] ?? `🔀 ${protocolo} — roteamento IP`;

    const networkObj = dijkstra(origemId, destinoId);
    console.log('networkObj:', networkObj);

    if (networkObj && networkObj.ids.length > 1) {

      const infoRota = document.createElement('div');
      infoRota.classList.add('rota-info');
      infoRota.innerHTML = `
        <h4>Objeto de Rede (networkObj)</h4>
        <p><em>${labelProtocolo}</em></p>
        <p style="margin-top:.5rem">
          <strong>Destino resolvido via:</strong> ${resolucaoLabel}
        </p>
        <hr style="border-color:rgba(0,229,255,.2);margin:.75rem 0">
        <p><strong>ipOrigem:</strong>  ${networkObj.ipOrigem}  <em>(${origemId} — gateway local)</em></p>
        <p><strong>ipDestino:</strong> ${networkObj.ipDestino} <em>(${destinoId})</em></p>
        <p><strong>ttl:</strong>       ${networkObj.ttl}</p>
        <p><strong>Saltos:</strong>    ${networkObj.ids.length - 1}</p>
        <p><strong>Distância:</strong> ${networkObj.distancia}px</p>
        <p style="margin-top:.5rem"><strong>rota (IPs):</strong></p>
        <code class="bits-preview">${networkObj.rota.join(' → ')}</code>
        <p style="margin-top:.5rem"><strong>rota (IDs):</strong></p>
        <code class="bits-preview">${networkObj.ids.join(' → ')}</code>
      `;
      containerDados.appendChild(infoRota);

      drawNetwork(networkObj.ids);
      drawRoute(networkObj.ids, origemId, destinoId);
      animatePacket(networkObj.ids, origemId, destinoId);

    } else {
      const err = document.createElement('p');
      err.textContent = 'Nenhuma rota encontrada.';
      containerDados.appendChild(err);
      drawNetwork();
    }

  } else {
    const aviso = document.createElement('p');
    aviso.textContent = 'Roteadores insuficientes para calcular rota.';
    containerDados.appendChild(aviso);
  }
}
