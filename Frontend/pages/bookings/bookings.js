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
}

const loadData = async () => {
  const container = document.getElementById('bookingsContainer')
  try {
    const response = await api.bookings.getMyBookings(token)
    const bookings = response.data
    container.innerHTML = ''

    if (bookings.length === 0) {
      container.innerHTML = '<p style="color: #EACEAA; text-align: center; grid-column: 1 / -1; opacity: 0.7;">คุณยังไม่มีประวัติการจองห้องประชุม</p>'
      return
    }

    bookings.forEach(booking => {
      const start = new Date(booking.start_time).toLocaleString('th-TH')
      const end = new Date(booking.end_time).toLocaleString('th-TH')

      let statusText = '✅ สำเร็จ'
      let statusColor = '#D39858'
      let cancelBtnHtml = ''

      if (booking.status === 'cancelled') {
        statusText = '🔴 ยกเลิกแล้ว'
        statusColor = '#85431E'
      } else {
        cancelBtnHtml = `<button onclick="cancelBooking(${booking.id})" class="btn-outline" style="margin-top: 15px; width: 100%; border-color: #85431E; color: #85431E;">ยกเลิกการจอง</button>`
      }

      const card = document.createElement('div')
      card.className = 'room-card'
      card.innerHTML = `
        <div class="room-info" style="padding: 30px 20px;">
          <h3>ห้อง: ${booking.room_name}</h3>
          <p style="color: ${statusColor}; margin-top: 15px; font-weight: bold;">สถานะ: ${statusText}</p>
          <div style="background: rgba(21,12,12,0.5); padding: 15px; border-radius: 12px; margin-top: 15px; border: 1px solid rgba(211,152,88,0.1);">
            <p style="margin-bottom: 5px; color: #FFF; font-size: 0.9rem;">🟢 <strong>เริ่ม:</strong> ${start}</p>
            <p style="margin-bottom: 0; color: #FFF; font-size: 0.9rem;">🔴 <strong>สิ้นสุด:</strong> ${end}</p>
          </div>
          ${cancelBtnHtml}
        </div>
      `
      container.appendChild(card)
    })
  } catch (error) {
    console.log(error)
    container.innerHTML = '<p style="color: #85431E; text-align: center; grid-column: 1 / -1;">โหลดข้อมูลล้มเหลว</p>'
  }
}

const cancelBooking = async (bookingId) => {
  if (!confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?')) return
  const messageDOM = document.getElementById('message')
  try {
    const response = await api.bookings.remove(bookingId, token)
    messageDOM.innerText = response.data.message
    messageDOM.className = 'message success'
    await loadData()
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    messageDOM.innerText = msg
    messageDOM.className = 'message danger'
  }
}