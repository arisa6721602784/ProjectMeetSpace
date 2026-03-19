window.onload = () => {
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault()
    submitData()
  })
}

const submitData = async () => {
  const messageDOM = document.getElementById('message')
  const data = {
    firstname: document.getElementById('firstname').value,
    lastname: document.getElementById('lastname').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  }

  try {
    const response = await api.users.register(data)
    messageDOM.innerText = response.data.message || 'สมัครสมาชิกสำเร็จ!'
    messageDOM.className = 'message success'
    setTimeout(() => {
      window.location.href = '../index.html'
    }, 800)
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    const errors = error.response?.data?.errors || []
    let html = `<div>${msg}</div><ul>`
    errors.forEach(e => { html += `<li>${e}</li>` })
    html += '</ul>'
    messageDOM.innerHTML = html
    messageDOM.className = 'message danger'
  }
}