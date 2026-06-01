# 🚀 Projeto Torre OSI - Camadas de Aplicação e Apresentação

Este projeto simula o fluxo de dados entre as **Camadas de Aplicação (7)** e **Apresentação (6)** do Modelo OSI, utilizando uma interface visual futurista estilo "Cyberpunk/Neon". O foco é demonstrar como os dados são gerados, criptografados e preparados para transmissão.

---

## 🧠 Conceitos Aplicados

| Camada | Função no Projeto |
|--------|-------------------|
| **Aplicação (7)** | O usuário interage pelo painel de controle, digitando uma URL/email ou anexando um arquivo. O sistema identifica o tipo de dado (Email, HTTP, Arquivo, Chat), cria um objeto estruturado (JSON) e aplica a **Cifra de César** nos campos sensíveis. Os dados são então salvos no `localStorage`. |
| **Apresentação (6)** | A camada de apresentação lê os dados salvos no `localStorage`. Ela exibe o objeto JSON de forma legível e colorida, **omitindo o campo `hostIP`** (URL), conforme solicitado pelo professor. Todos os textos criptografados aparecem com caracteres deslocados (Cifra de César), representando a conversão de formato. |

---

## ⚙️ Como o Sistema Funciona (Passo a Passo)

1. **Entrada do Usuário**  
   - Digita um texto no campo `CMD > DIGITE A URL/EMAIL:`  
   - *Exemplos:* `www.google.com`, `email@teste.com`, `meu-site`  
   - Ou anexa um arquivo pelo botão `ANEXAR ARQUIVO`

2. **Identificação do Protocolo (Camada de Aplicação)**  
   - O JavaScript analisa a entrada:
     - Se contém `@` → **SMTP/POP3** (E-mail)
     - Se contém `www` → **HTTP/HTTPS** (Site)
     - Se é um arquivo → **FTP/HTTP** (Arquivo)
     - Caso contrário → **WEBSOCKET** (Chat genérico)

3. **Criação do Objeto JSON**  
   - Para cada tipo, é criado um objeto específico (seguindo o modelo passado pelo professor):
     - *Email:* `remetente`, `destinatario`, `assunto`, `corpo`, etc.
     - *HTTP:* `metodo`, `hostIP`, `protocolo`, `usuario`, etc.
     - *Arquivo:* `nomeArquivo`, `formato`, `remetente`, etc.
     - *Chat:* `usuario`, `mensagem`, `protocolo`, etc.

4. **Aplicação da Cifra de César (Criptografia Simples)**  
   - Todos os campos de texto (ex: `assunto`, `corpo`, `nomeArquivo`, `mensagem`) são deslocados em **3 posições** no alfabeto.  
   - *Exemplo:* `"Maria"` → `"Pduld"`  
   - O campo `hostIP` (URL) **não** é criptografado, pois será omitido na exibição.

5. **Armazenamento Temporário**  
   - O objeto JSON é salvo no **`localStorage`** do navegador. Isso simula a passagem dos dados entre as camadas (Aplicação → Apresentação).

6. **Camada de Apresentação**  
   - Ao clicar em **EXECUTAR** (ou ao recarregar a página se houver dados salvos), a camada de apresentação:
     - Lê os dados do `localStorage`.
     - Remove o campo `hostIP` (se existir).
     - Exibe o JSON de forma colorida e indentada dentro da área "Camada de Apresentação".
     - Mostra todos os campos criptografados, evidenciando a transformação dos dados.

---

## 🎨 Interface Visual

O projeto utiliza uma estética **Torre OSI** com:
- Luzes **neon ciano** (Camada de Aplicação - topo)
- Luzes **neon rosa** (Camada Base - controle)
- Luzes **neon amarelo** (Camada de Apresentação)
- Efeitos de **scanline** (linhas de varredura) no display holográfico
- Ícones de rede (`globe`, `lock`, `shield`, `server`) representando as camadas inferiores do OSI

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** – Estrutura da página e da Torre OSI
- **CSS3** – Estilização neon, flexbox, responsividade
- **JavaScript (ES6 Módulos)** – Lógica das camadas, Cifra de César, manipulação do DOM e `localStorage`
- **Fontes:** `Audiowide` (títulos) e `Poppins` (textos)
- **Ícones:** FontAwesome

---

