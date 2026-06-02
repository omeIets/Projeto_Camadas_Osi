import { application } from './application.js';
import { presentation } from './presentation.js';

function executarCicloOSI() {
  application();
  presentation();
}

document.addEventListener('DOMContentLoaded', () => {

  // Remove dados antigos para começar limpo
  localStorage.removeItem('dadosApresentacao');

  const reqBtn = document.querySelector('.request-btn');
  if (reqBtn) {
    reqBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executarCicloOSI();
    });
  }
});