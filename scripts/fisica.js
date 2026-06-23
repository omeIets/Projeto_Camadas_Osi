export function camadaFisica(quadros) {
  const bits = JSON.stringify(quadros)
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');

  console.log('CAMADA FÍSICA', bits);
  return bits;
}
