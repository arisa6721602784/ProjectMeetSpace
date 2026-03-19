window.onload = () => {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault()
    submitData()
  })
}

const submitData = async () => {
  const messageDOM = document.getElementById('message')
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  try {
    const response = await api.users.login({ email, password })
    const data = response.data

    messageDOM.innerText = data.message + ' ยินดีต้อนรับคุณ ' + data.user.firstname
    messageDOM.className = 'message success'

    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.user.role)
    localStorage.setItem('user', JSON.stringify(data.user))

    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = './admin/admin.html'
      } else {
        window.location.href = './rooms/rooms.html'
      }
    }, 800)

  } catch (error) {
    const msg = error.response?.data?.message || error.message
    messageDOM.innerText = msg
    messageDOM.className = 'message danger'
  }
}