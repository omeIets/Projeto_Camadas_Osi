import { cifraCesar } from './cifra.js';

const USER_NAME = 'maria.leticia';

export function application() {
  // 1. Atualiza o nome do usuário no cabeçalho (executa sempre que a função roda)
  const userElement = document.querySelector('#userNameDisplay');
  if (userElement) {
    userElement.textContent = `${USER_NAME}`;
  }

  // 2. Elemento de exibição do protocolo
  const protocolDisplay = document.querySelector('#protocolDisplay');
  
  const reqText = document.querySelector('.text-input').value;
  const fileInput = document.querySelector('#arquivo');
  const file = fileInput.files[0];
  
  let objetoGerado = {};
  let nomeProtocolo = '';

  // 3. Identificar o tipo e criar o objeto
  if (reqText.includes('@')) {
    nomeProtocolo = '📧 SMTP / POP3';
    objetoGerado = {
      tipo: 'email',
      remetente: USER_NAME,
      destinatario: reqText,
      assunto: 'Assunto do Email (Simulado)',
      corpo: 'Corpo da mensagem...',
      protocolo: 'SMTP/POP',
      timestamp: Date.now()
    };
    objetoGerado.assunto = cifraCesar(objetoGerado.assunto);
    objetoGerado.corpo = cifraCesar(objetoGerado.corpo);

  } else if (reqText.includes('www')) {
    nomeProtocolo = '🌐 HTTP / HTTPS';
    objetoGerado = {
      tipo: 'http_request',
      metodo: 'GET',
      hostIP: reqText,
      protocolo: 'HTTP/HTTPS',
      usuario: USER_NAME,
      timestamp: Date.now()
    };

  } else if (file) {
    nomeProtocolo = '📁 FTP / HTTP';
    const nomePartes = file.name.split('.');
    const extensao = nomePartes.length > 1 ? nomePartes.pop() : 'desconhecido';
    const nomeSemExt = nomePartes.join('.');
    
    objetoGerado = {
      tipo: 'arquivo',
      nomeArquivo: nomeSemExt,
      formato: extensao,
      remetente: USER_NAME,
      protocolo: 'FTP/HTTP',
      timestamp: Date.now()
    };
    objetoGerado.nomeArquivo = cifraCesar(objetoGerado.nomeArquivo);

  } else {
    nomeProtocolo = '💬 WEBSOCKET';
    objetoGerado = {
      tipo: 'chat',
      usuario: USER_NAME,
      mensagem: reqText || 'Mensagem vazia',
      protocolo: 'WEBSOCKET',
      timestamp: Date.now()
    };
    objetoGerado.mensagem = cifraCesar(objetoGerado.mensagem);
  }

  // 4. Atualiza o texto do display do protocolo
  if (protocolDisplay) {
    protocolDisplay.textContent = nomeProtocolo;
  }

  // 5. Salvar no localStorage
  localStorage.setItem('dadosApresentacao', JSON.stringify(objetoGerado));

  return objetoGerado;
}

export function handleApplicationClick() {
  return application();
}