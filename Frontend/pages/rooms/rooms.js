const token = localStorage.getItem('token')
const userStr = localStorage.getItem('user')

window.onload = async () => {
  if (!token || !userStr) {
    window.location.href = '../index.html'
    return
  }
  const user = JSON.parse(userStr)
  const displayElement = document.getElementById('userNameDisplay')
  if (displayElement) displayElement.innerText = `ยินดีต้อนรับ, คุณ ${user.firstname}`

  await loadData()

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../index.html'
  })

  document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault()
    submitData()
  })
}

const loadData = async () => {
  try {
    const response = await api.rooms.getAll()
    const rooms = response.data
    const container = document.getElementById('roomsContainer')
    container.innerHTML = ''

    rooms.forEach(room => {
      let btnText = 'จองห้องนี้'
      let btnDisabled = ''
      let btnStyle = 'background: linear-gradient(135deg, #85431E, #D39858); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;'
      let statusLabel = 'ว่าง'
      let statusColor = '#D39858'

      if (room.status === 'occupied') {
        btnText = 'ไม่ว่าง'
        btnDisabled = 'disabled'
        btnStyle = 'background-color: rgba(52,21,15,0.6); color: rgba(234,206,170,0.5); border: 1px solid rgba(234,206,170,0.1); padding: 10px 20px; border-radius: 8px; cursor: not-allowed;'
        statusLabel = 'ไม่ว่าง'
        statusColor = '#85431E'
      } else if (room.status === 'maintenance') {
        btnText = 'ปิดปรับปรุง'
        btnDisabled = 'disabled'
        btnStyle = 'background-color: #150C0C; color: #85431E; border: 1px solid #85431E; padding: 10px 20px; border-radius: 8px; cursor: not-allowed;'
        statusLabel = 'ปิดปรับปรุง'
        statusColor = '#85431E'
      }

      const card = document.createElement('div')
      card.className = 'room-card'
      card.innerHTML = `
        <div class="room-image" style="height: 200px; overflow: hidden;">
          ${room.image_url
            ? `<img src="http://localhost:8000${room.image_url}" style="width:100%; height:100%; object-fit:cover;">`
            : `<span style="color: #EACEAA; opacity: 0.3;">ไม่มีรูปภาพ</span>`}
        </div>
        <div class="room-info" style="padding: 20px;">
          <h3 style="color: #EACEAA; margin-bottom: 10px;">${room.name}</h3>
          <p style="color: #EACEAA; opacity: 0.7; font-size: 0.9rem; margin-bottom: 15px;">${room.description || 'ไม่มีคำอธิบาย'}</p>
          <div class="room-meta" style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.85rem;">
            <span>👥 ความจุ: ${room.capacity} คน</span>
            <span style="color: ${statusColor}; font-weight: 600;">● ${statusLabel}</span>
          </div>
          <button onclick="bookRoom(${room.id})" ${btnDisabled} style="${btnStyle}">${btnText}</button>
        </div>
      `
      container.appendChild(card)
    })
  } catch (error) {
    console.log(error)
  }
}

const submitData = async () => {
  const messageDOM = document.getElementById('message')
  const room_id = document.getElementById('bookRoomId').value
  const start_time = document.getElementById('startTime').value
  const end_time = document.getElementById('endTime').value

  try {
    const response = await api.bookings.create({ room_id, start_time, end_time }, token)
    messageDOM.innerText = response.data.message
    messageDOM.className = 'message success'
    setTimeout(() => {
      closeModal()
      loadData()
    }, 800)
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    messageDOM.innerText = msg
    messageDOM.className = 'message danger'
  }
}

function bookRoom(roomId) {
  document.getElementById('bookRoomId').value = roomId
  document.getElementById('message').className = 'message'
  document.getElementById('bookingModal').style.display = 'flex'
}

function closeModal() {
  document.getElementById('bookingModal').style.display = 'none'
  document.getElementById('bookingForm').reset()
}