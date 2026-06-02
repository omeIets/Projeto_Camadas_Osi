export function presentation() {
  const dadosString = localStorage.getItem('dadosApresentacao');
  const container = document.getElementById('display-criptografado');

  if (!container) {
    console.error('Elemento #display-criptografado não encontrado');
    return;
  }

  if (!dadosString) {
    container.innerHTML = `<p class="placeholder">Nenhum dado encontrado. Faça uma requisição primeiro.</p>`;
    return;
  }

  try {
    const objeto = JSON.parse(dadosString);
    
    // Converte o timestamp para data legível
    if (objeto.timestamp) {
    const data = new Date(objeto.timestamp);
    // Formata como: DD/MM/AAAA HH:MM:SS
    const dataFormatada = data.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    // Substitui o timestamp original pela data formatada
    objeto.timestamp = dataFormatada;
    }

    // Omitir a URL (hostIP)
    if (objeto.hostIP) {
      delete objeto.hostIP;
    }

    const jsonString = JSON.stringify(objeto, null, 2);

    const htmlFormatado = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span class="obj-key">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span class="obj-string">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="obj-value">$1</span>');

    container.innerHTML = `<pre>${htmlFormatado}</pre>`;

  } catch (erro) {
    console.error('Erro ao processar JSON:', erro);
    container.innerHTML = `<p class="placeholder">Erro ao exibir dados.</p>`;
  }
}