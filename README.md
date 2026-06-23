# 🌐 Torre OSI — Simulador do Modelo de 7 Camadas

Interface visual futurista estilo **Cyberpunk/Neon** que simula o percurso completo de dados pelas **7 camadas do Modelo OSI**, desde a digitação do usuário até a animação do pacote trafegando por uma rede de 100 roteadores reais.

---

## 🧠 Camadas Implementadas

| # | Camada | Implementação |
|---|--------|---------------|
| 7 | **Aplicação** | Detecta protocolo pelo input (e-mail, URL, texto, arquivo). Exibe formulário específico por tipo. |
| 6 | **Apresentação** | Encripta dados com **AES-GCM 256-bit** (Web Crypto API nativa). Gera chave e salva no `localStorage`. Assina **JWT HS256** com payload encriptado. Consulta **DNS Google** para resolver o IP do destino. |
| 5 | **Sessão** | Cria `sessionId` único com `crypto.randomUUID()` e registra `inicioSessao`. |
| 4 | **Transporte** | Monta objeto TCP com `packetId`, `protocoloTransporte: "TCP"`, `portaOrigem` efêmera e `portaDestino` por protocolo (SMTP→587, HTTPS→443, HTTP/WS→80, FTP→21). |
| 3 | **Rede** | Algoritmo de Dijkstra sobre os 100 roteadores reais fornecidos pelo professor. Destino determinístico pelo IP resolvido no DNS. Retorna `networkObj` com `ipOrigem`, `ipDestino`, `rota`, `ttl`. |
| 2 | **Enlace** | Quadro Ethernet IEEE 802.3 com `macOrigem` e `macDestino` derivados dinamicamente dos UUIDs da sessão, `EtherType: 0x0800` (IPv4), tamanho do quadro e `FCS` (CRC-32 simulado). |
| 1 | **Física** | Converte o quadro inteiro para representação binária (bits). |

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

### 2. Pipeline das Camadas (Apresentação → Física)

```
Formulário enviado
    │
    ▼
[Apresentação]  AES-GCM 256-bit (chave no localStorage)
                JWT HS256 (secret hardcoded)
                DNS Google (resolve IP real do destino)
    │
    ▼
[Sessão]  sessionId = crypto.randomUUID()
    │
    ▼
[Transporte]  packetId, TCP, portaOrigem efêmera, portaDestino por protocolo
    │
    ▼
[Enlace]  Quadro Ethernet com MACs dinâmicos + FCS CRC-32
    │
    ▼
[Física]  Representação em bits binários
    │
    ▼
localStorage → resultado.html
    │
    ▼
[Rede]  Dijkstra nos 100 roteadores → animação no canvas
```

### 3. Roteamento (Camada 3)

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
│   ├── apresentacao.js     → AES-GCM, JWT, DNS Google, orquestrador
│   ├── sessao.js           → Session ID nativo
│   ├── transporte.js       → TCP, portas, packet ID
│   ├── enlace.js           → Quadro Ethernet IEEE 802.3 dinâmico
│   ├── fisica.js           → Conversão para bits binários
│   ├── network.js          → Dijkstra + networkObj (formato professor)
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

## 🔑 Segurança Aplicada

| Técnica | Onde |
|---------|------|
| **AES-GCM 256-bit** | Camada de Apresentação — encripta os dados antes do JWT |
| **Chave AES no `localStorage`** | Gerada na primeira execução, reutilizada depois |
| **JWT HS256** | Assinado com secret hardcoded (`'chave-teste'`) |
| **IV aleatório** | Gerado a cada transmissão (96 bits via `getRandomValues`) |
| **MACs derivados de UUID** | Enlace — rastreáveis mas únicos por sessão |

---

## 🚀 Como Executar

```bash
cd projeto-modelo-osi
python -m http.server 8081
```

Acesse **http://localhost:8081** no navegador.

> ⚠️ É necessário servir via HTTP (não abrir o arquivo diretamente) por causa dos módulos ES e da Web Crypto API.

---

## 👤 Autora

**Maria Letícia** — Projeto de Redes de Computadores, IFPE
