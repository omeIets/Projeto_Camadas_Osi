# 🌐 Torre OSI — Simulador do Modelo de 7 Camadas

Interface visual futurista estilo **Cyberpunk/Neon** que simula o percurso completo de dados pelas **7 camadas do Modelo OSI**, desde a digitação do usuário até a transmissão em bits pelo meio físico.

---

## 🧠 Camadas Implementadas

| # | Camada | Implementação |
|---|--------|---------------|
| 7 | **Aplicação** | Detecta protocolo pelo input (e-mail, URL, texto, arquivo). Exibe formulário específico por tipo. |
| 6 | **Apresentação** | Encripta dados com **AES-GCM 256-bit** (Web Crypto API nativa). Gera chave e salva no `localStorage`. Assina **JWT HS256** com payload encriptado. Consulta **DNS Google** para resolver o IP do destino. |
| 5 | **Sessão** | Cria `sessionId` único com `crypto.randomUUID()` e registra `inicioSessao`. |
| 4 | **Transporte** | Monta objeto TCP com `packetId`, `protocoloTransporte: "TCP"`, `portaOrigem` efêmera e `portaDestino` por protocolo (SMTP→587, HTTPS→443, HTTP/WS→80, FTP→21). |
| 3 | **Rede** | Algoritmo de **Dijkstra** sobre 100 roteadores fornecidos pelo professor. Destino determinístico pelo IP resolvido via DNS Google. Retorna `networkObj` com `ipOrigem`, `ipDestino`, `rota`, `ttl` e exibe animação do pacote no canvas. |
| 2 | **Enlace** | Frame Ethernet com `frameId`, `macOrigem` (simulado/persistido no `localStorage`), `macDestino` (fictício do roteador receptor), `tipo: "IPv4"` e `crc` via **MD5** do payload. |
| 1 | **Física** | Recebe o frame da Enlace, recalcula o MD5 e compara com o CRC para verificar integridade. Converte tudo para bits binários e encerra a transmissão. |

---

## ⚙️ Como Funciona

### 1. Identificação do Protocolo (Camada 7)

Digite qualquer coisa no painel CMD e clique **EXECUTAR**:

| Entrada | Protocolo | Formulário |
|---------|-----------|------------|
| `email@dominio.com` | 📧 SMTP/POP3 | E-mail com remetente, destinatário, assunto e corpo |
| `www.site.com` / `https://` | 🌐 HTTP/HTTPS | Requisição web com método (GET/POST/PUT/DELETE) |
| `ws://` / texto simples | 💬 WEBSOCKET | Chat com destinatário e mensagem |
| Arquivo anexado | 📁 FTP/HTTP | Upload de arquivo |

### 2. Pipeline das Camadas (7 → 1)

```
Formulário enviado
    │
    ▼
[7 — Aplicação]   Detecta protocolo, monta dados brutos
    │
    ▼
[6 — Apresentação]  AES-GCM 256-bit + JWT HS256 + DNS Google
    │
    ▼
[5 — Sessão]  sessionId = crypto.randomUUID() + inicioSessao
    │
    ▼
[4 — Transporte]  packetId, TCP, portaOrigem efêmera, portaDestino por protocolo
    │
    ▼
[3 — Rede]  Dijkstra nos 100 roteadores → networkObj com rota IP
    │
    ▼
[2 — Enlace]  frameId + macOrigem + macDestino + tipo + CRC (MD5)
    │
    ▼
[1 — Física]  Verifica CRC → converte para bits → transmissão encerrada
    │
    ▼
localStorage → resultado.html (exibe todas as camadas + canvas animado)
```

### 3. Camada de Enlace — Estrutura do Frame

```json
{
  "frameId":    "F001",
  "macOrigem":  "02:A3:F1:7C:4E:B9",
  "macDestino": "02:4F:8A:3D:C1:E5",
  "tipo":       "IPv4",
  "crc":        "A3F2C1D894E7B06F..."
}
```

- **`frameId`** — ID sequencial do frame (`F001`, `F002`…)
- **`macOrigem`** — MAC simulado desta máquina, gerado uma vez e persistido no `localStorage`
- **`macDestino`** — MAC fictício do roteador/switch receptor, derivado deterministicamente do `packetId`
- **`tipo`** — `"IPv4"`
- **`crc`** — Hash **MD5** do `JSON.stringify` do payload encapsulado

### 4. Camada Física — Verificação de Integridade

A camada física recalcula o MD5 dos dados recebidos e compara com o CRC enviado pela Enlace:

- ✅ **Hashes iguais** → mensagem íntegra, nenhum frame foi perdido
- ❌ **Hashes diferentes** → mensagem corrompida durante a transmissão

Em seguida converte todo o frame para representação binária, encerrando a simulação.

### 5. Roteamento (Camada 3)

- **Origem:** sempre `R1 (10.0.0.1)` — gateway local, igual para todos os protocolos
- **Destino:** determinístico pelo IP real resolvido via DNS Google — mesma URL sempre roteia para o mesmo roteador
- **Sem DNS** (chat/WebSocket): hash do nome do protocolo → destino fixo e consistente por tipo
- Algoritmo **Dijkstra** com custo euclidiano entre coordenadas dos roteadores
- Canvas animado: o pacote percorre a rota em tempo real com ~60fps

---

## 🗂️ Estrutura de Arquivos

```
projeto-modelo-osi/
├── index.html              → Torre OSI (interface principal)
├── resultado.html          → Exibe todas as camadas + canvas animado
├── scripts/
│   ├── application.js      → Detecção de protocolo, formulários, UI
│   ├── apresentacao.js     → AES-GCM, JWT, DNS Google, orquestrador do pipeline
│   ├── sessao.js           → Session ID nativo (crypto.randomUUID)
│   ├── transporte.js       → TCP, portas, packet ID
│   ├── camada_rede.js      → Camada de Rede: executa Dijkstra no pipeline OSI
│   ├── enlace.js           → Frame Ethernet: frameId, MACs, tipo, CRC via MD5
│   ├── fisica.js           → Verifica integridade CRC + converte para bits
│   ├── network.js          → Algoritmo Dijkstra + networkObj 
│   ├── points.js           → 100 roteadores (IPs, coordenadas, conexões)
│   ├── animation.js        → Canvas: rede + rota + animação do pacote
│   └── resultado.js        → Renderiza todas as camadas na página resultado
├── style/
│   ├── reset.css
│   ├── global.css
│   ├── header.css
│   ├── main.css
│   └── resultado.css
└── imagem/
    ├── router-green.png    → Roteador ativo
    ├── router-red.png      → Roteador inativo
    └── packet.png          → Pacote animado
```

---

## 🔑 Segurança e Integridade Aplicadas

| Técnica | Onde | Finalidade |
|---------|------|------------|
| **AES-GCM 256-bit** | Camada 6 — Apresentação | Encripta os dados antes do JWT |
| **Chave AES no `localStorage`** | Apresentação | Gerada na 1ª execução, reutilizada |
| **JWT HS256** | Apresentação | Assina o payload com secret |
| **IV aleatório (96 bits)** | AES-GCM | Garante unicidade de cada cifra |
| **MD5 (CRC)** | Camada 2 — Enlace | Hash do payload para verificação |
| **Verificação de integridade** | Camada 1 — Física | Recalcula MD5 e compara com CRC |
| **MAC persistido** | Enlace | Simula endereço físico fixo do dispositivo |

---

## 🚀 Como Executar

```bash
cd projeto-modelo-osi
python -m http.server 8081
```

Acesse **http://localhost:8081** no navegador.

> ⚠️ É necessário servir via HTTP (não abrir o arquivo diretamente) por causa dos módulos ES, da Web Crypto API e das importações de CDN.

---

## 👤 Autora

**Maria Letícia** — Projeto de Redes de Computadores, IFPE
