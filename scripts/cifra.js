export function cifraCesar(texto, deslocamento = 3) {
  if (!texto || typeof texto !== 'string') return texto;
  return texto.split('').map(char => {
    if (char >= 'a' && char <= 'z') {
      return String.fromCharCode(((char.charCodeAt(0) - 97 + deslocamento) % 26) + 97);
    } else if (char >= 'A' && char <= 'Z') {
      return String.fromCharCode(((char.charCodeAt(0) - 65 + deslocamento) % 26) + 65);
    }
    return char;
  }).join('');
}