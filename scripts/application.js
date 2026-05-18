const USER_NAME = 'gleydson.brito'

const user = document.querySelector('.user')
user.textContent = `Usuário: ${USER_NAME}`

const reqBtn = document.querySelector('.request-btn')
reqBtn.addEventListener('click', function(event) {
  event.preventDefault()
  const protocolName = document.querySelector('.protocol-name')
  const reqText = document.querySelector('.text-input')
  const requestText = reqText.value
 
  if(requestText.includes('@')) {
    protocolName.textContent = 'SMTP/POP'
  } else if (requestText.includes('www')) {
    protocolName.textContent = 'HTTP/HTTPS'
  } else {
    protocolName.textContent = 'WEBSOCKET'
  }
  reqText.value = ''
})

const inputFile = document.querySelector('#arquivo')
inputFile.addEventListener('change', () => {
  if(inputFile.files.length > 0) {
    const file = inputFile.files[0]
    alert(file.name)
  }
})

inputFile.addEventListener('cancel', () => {
  alert('Cancelado')
})
