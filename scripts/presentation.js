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