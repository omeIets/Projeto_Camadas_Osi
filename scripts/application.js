import { camadaApresentacao } from './apresentacao.js';

// --- Identificação do Usuário & Logout ---
let USER_NAME = localStorage.getItem('nome-usuario');

if (!USER_NAME) {
  const inputName = prompt('Digite o nome do usuário:');
  USER_NAME = inputName ? inputName.trim() : 'Visitante';
  localStorage.setItem('nome-usuario', USER_NAME);
}

const userElement = document.querySelector('#userNameDisplay');
if (userElement) userElement.textContent = USER_NAME;

const btnLogout = document.querySelector('#btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('nome-usuario');
    window.location.reload();
  });
}

// --- Elementos do DOM ---
const reqInput      = document.querySelector('.text-input');
const btnEnviar     = document.querySelector('.request-btn');
const protocolDisplay = document.querySelector('#protocolDisplay');

const emailForm     = document.querySelector('.email-form');
const chatForm      = document.querySelector('.chat-form');
const siteForm      = document.querySelector('.site-form');
const siteHostInput = document.querySelector('#site-host');
const inputFile     = document.querySelector('#arquivo');

// --- Utilitários ---
function limparFormularios() {
  if (emailForm) emailForm.classList.add('hidden');
  if (chatForm)  chatForm.classList.add('hidden');
  if (siteForm)  siteForm.classList.add('hidden');
}

reqInput.addEventListener('input', () => {
  btnEnviar.classList.toggle('active', reqInput.value.length > 0);
});

// --- Identificação do Protocolo ---
btnEnviar.addEventListener('click', (event) => {
  event.preventDefault();

  const rawValue = reqInput.value.trim();
  const value    = rawValue.toLowerCase();

  if (value === '') return;

  limparFormularios();

  let protocolo = '';

  if (value.includes('@')) {
    // E-mail detectado → SMTP
    protocolo = '📧 SMTP / POP3';
    if (emailForm) emailForm.classList.remove('hidden');

  } else if (value.startsWith('ws://') || value.startsWith('wss://')) {
    // WebSocket explícito
    protocolo = '💬 WEBSOCKET';
    if (chatForm) chatForm.classList.remove('hidden');

  } else if (
    value.startsWith('http') ||
    value.includes('www')    ||
    value.includes('.com')   ||
    value.includes('.br')    ||
    value.includes('.net')   ||
    value.includes('.org')
  ) {
    // URL detectada → HTTP/HTTPS
    protocolo = '🌐 HTTP / HTTPS';
    if (siteForm) {
      siteForm.classList.remove('hidden');
      if (siteHostInput) siteHostInput.value = rawValue;
    }

  } else {
    // Texto simples → trata como mensagem de chat (WebSocket)
    protocolo = '💬 WEBSOCKET';
    if (chatForm) {
      chatForm.classList.remove('hidden');
      // Pré-preenche o campo mensagem com o texto digitado
      const msgInput = document.querySelector('#chat-mensagem');
      if (msgInput) msgInput.value = rawValue;
    }
  }

  if (protocolDisplay) protocolDisplay.textContent = protocolo;

  reqInput.value = '';
  btnEnviar.classList.remove('active');
});

// --- Envio: E-mail (SMTP) ---
if (emailForm) {
  emailForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dadosEmail = {
      tipo:         'E-mail (SMTP)',
      remetente:    document.querySelector('#remetente').value,
      destinatario: document.querySelector('#destinatario').value,
      assunto:      document.querySelector('#assunto').value,
      corpo:        document.querySelector('#corpo').value,
      protocolo:    document.querySelector('#protocolo').value,
      timestamp:    new Date().toLocaleTimeString(),
    };

    console.log('Camada de Aplicação → E-mail:', dadosEmail);
    await camadaApresentacao(dadosEmail);
    emailForm.reset();
    limparFormularios();
  });
}

// --- Envio: Chat (WebSocket) ---
if (chatForm) {
  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dadosChat = {
      tipo:         'Mensagem de Chat',
      usuario:      USER_NAME,
      destinatario: document.querySelector('#chat-destinatario').value,
      mensagem:     document.querySelector('#chat-mensagem').value,
      protocolo:    'WEBSOCKET',
      timestamp:    new Date().toLocaleTimeString(),
    };

    console.log('Camada de Aplicação → Chat:', dadosChat);
    await camadaApresentacao(dadosChat);
    chatForm.reset();
    limparFormularios();
  });
}

// --- Envio: Upload de Arquivo (FTP/HTTP) ---
if (inputFile) {
  inputFile.addEventListener('change', async () => {
    if (inputFile.files.length > 0) {
      const file  = inputFile.files[0];
      const partes = file.name.split('.');
      const formato = partes.length > 1 ? partes.pop() : 'desconhecido';

      const dadosArquivo = {
        tipo:        'Upload de Arquivo',
        nomeArquivo: file.name,
        formato,
        remetente:   USER_NAME,
        protocolo:   'FTP/HTTP',
        timestamp:   new Date().toLocaleTimeString(),
      };

      console.log('Camada de Aplicação → Arquivo:', dadosArquivo);
      alert(`Arquivo "${file.name}" carregado! Transmitindo...`);
      await camadaApresentacao(dadosArquivo);
    }
  });
}

// --- Envio: Requisição Web (HTTP/HTTPS) ---
if (siteForm) {
  siteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dadosSite = {
      tipo:      'Requisição Web (HTTP)',
      metodo:    document.querySelector('#site-metodo').value,
      host:      document.querySelector('#site-host').value,
      usuario:   USER_NAME,
      protocolo: 'HTTP/HTTPS',
      timestamp: new Date().toLocaleTimeString(),
    };

    console.log('Camada de Aplicação → Site:', dadosSite);
    await camadaApresentacao(dadosSite);
    siteForm.reset();
    limparFormularios();
  });
}