export function camadaSessao(payload, dns = null) {
  // sessionId gerado pela cripto nativa do browser
  const sessao = {
    sessionId:    crypto.randomUUID(),
    inicioSessao: new Date().toISOString(),
    dns,          // resultado do DNS Google
    dados:        payload,
  };

  console.log('═══ CAMADA DE SESSÃO ═══', sessao);
  return sessao;
}
