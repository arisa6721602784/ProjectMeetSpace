const token = localStorage.getItem('token')
const role = localStorage.getItem('role')

window.onload = async () => {
  if (!token || role !== 'admin') {
    window.location.href = '../index.html'
    return
  }

  await loadData()
  await loadAdminBookings()

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../index.html'
  })

  document.getElementById('addRoomForm').addEventListener('submit', (e) => {
    e.preventDefault()
    submitData()
  })

  document.getElementById('editRoomForm').addEventListener('submit', (e) => {
    e.preventDefault()
    submitEdit()
  })
}

const loadData = async () => {
  try {
    const response = await api.rooms.getAll()
    const rooms = response.data
    const tbody = document.getElementById('adminRoomsTable')
    tbody.innerHTML = ''

    rooms.forEach(room => {
      const defaultImg = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
      const imageUrl = room.image_url ? `http://localhost:8000${room.image_url}` : defaultImg
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td style="padding: 15px;"><img src="${imageUrl}" alt="room" style="width: 80px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
        <td style="padding: 15px; font-weight: 500;">${room.name}</td>
        <td style="padding: 15px;">👥 ${room.capacity} คน</td>
        <td style="padding: 15px;">
          <button onclick="openEditRoomModal(${room.id}, '${room.name}', '${room.description || ''}', ${room.capacity})" class="btn-primary-small">แก้ไข</button>
          <select onchange="updateRoomStatus(${room.id}, this.value)">
            <option value="available" ${room.status === 'available' ? 'selected' : ''}>🟢 ว่าง</option>
            <option value="occupied" ${room.status === 'occupied' ? 'selected' : ''}>⚪ ไม่ว่าง</option>
            <option value="maintenance" ${room.status === 'maintenance' ? 'selected' : ''}>🔴 ปิดปรับปรุง</option>
          </select>
          <button onclick="deleteRoom(${room.id})" class="btn-danger-small">ลบ</button>
        </td>
      `
      tbody.appendChild(tr)
    })
  } catch (error) {
    console.log(error)
  }
}

const submitData = async () => {
  const messageDOM = document.getElementById('messageAdd')
  const formData = new FormData()
  formData.append('name', document.getElementById('roomName').value)
  formData.append('description', document.getElementById('roomDesc').value)
  formData.append('capacity', document.getElementById('roomCapacity').value)
  const imageFile = document.getElementById('roomImage').files[0]
  if (imageFile) formData.append('image', imageFile)

  try {
    const response = await api.rooms.create(formData, token)
    messageDOM.innerText = response.data.message
    messageDOM.className = 'message success'
    setTimeout(() => {
      closeAddRoomModal()
      loadData()
    }, 800)
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    messageDOM.innerText = msg
    messageDOM.className = 'message danger'
  }
}

const submitEdit = async () => {
  const messageDOM = document.getElementById('messageEdit')
  const id = document.getElementById('editRoomId').value
  const formData = new FormData()
  formData.append('name', document.getElementById('editRoomName').value)
  formData.append('description', document.getElementById('editRoomDesc').value)
  formData.append('capacity', document.getElementById('editRoomCapacity').value)
  const imageFile = document.getElementById('editRoomImage').files[0]
  if (imageFile) formData.append('image', imageFile)

  try {
    const response = await api.rooms.update(id, formData, token)
    messageDOM.innerText = response.data.message
    messageDOM.className = 'message success'
    setTimeout(() => {
      closeEditRoomModal()
      loadData()
    }, 800)
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    messageDOM.innerText = msg
    messageDOM.className = 'message danger'
  }
}

const loadAdminBookings = async () => {
  try {
    const response = await api.bookings.getAll(token)
    const bookings = response.data
    const tbody = document.getElementById('adminBookingsTable')
    tbody.innerHTML = ''

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #EACEAA; opacity: 0.5;">ยังไม่มีประวัติการจองในระบบ</td></tr>'
      return
    }

    bookings.forEach(booking => {
      const start = new Date(booking.start_time).toLocaleString('th-TH')
      const end = new Date(booking.end_time).toLocaleString('th-TH')
      const statusText = booking.status === 'cancelled'
        ? '<span style="color: #85431E; font-weight:bold;">🔴 ยกเลิกแล้ว</span>'
        : '<span style="color: #D39858; font-weight:bold;">✅ สำเร็จ</span>'

      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td style="padding: 15px; font-weight: bold; color: #D39858;">#${booking.id}</td>
        <td style="padding: 15px;">
          <div style="font-weight: 600; color: #FFF;">คุณ ${booking.firstname} ${booking.lastname}</div>
          <div style="font-size: 0.85rem; color: #EACEAA; opacity: 0.8;">📧 ${booking.email}</div>
        </td>
        <td style="padding: 15px; font-weight: bold; color: #EACEAA;">${booking.room_name}</td>
        <td style="padding: 15px; font-size: 0.9rem; color: #FFF;">
          <div><strong>เริ่ม:</strong> ${start}</div>
          <div><strong>จบ:</strong> ${end}</div>
        </td>
        <td style="padding: 15px;">${statusText}</td>
      `
      tbody.appendChild(tr)
    })
  } catch (error) {
    console.log(error)
  }
}

const updateRoomStatus = async (id, newStatus) => {
  try {
    const formData = new FormData()
    formData.append('status', newStatus)
    await api.rooms.update(id, formData, token)
    await loadData()
  } catch (error) {
    console.log(error)
  }
}

const deleteRoom = async (id) => {
  if (!confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบห้องนี้?')) return
  const messageDOM = document.getElementById('message')
  try {
    await api.rooms.remove(id, token)
    messageDOM.innerText = 'ลบห้องสำเร็จ'
    messageDOM.className = 'message success'
    await loadData()
  } catch (error) {
    const msg = error.response?.data?.message || error.message
    messageDOM.innerText = msg
    messageDOM.className = 'message danger'
  }
}

function openAddRoomModal() {
  document.getElementById('addRoomModal').style.display = 'flex'
}

function closeAddRoomModal() {
  document.getElementById('addRoomModal').style.display = 'none'
  document.getElementById('addRoomForm').reset()
  document.getElementById('messageAdd').className = 'message'
}

function openEditRoomModal(id, name, desc, capacity) {
  document.getElementById('editRoomId').value = id
  document.getElementById('editRoomName').value = name
  document.getElementById('editRoomDesc').value = desc === 'null' ? '' : desc
  document.getElementById('editRoomCapacity').value = capacity
  document.getElementById('editRoomModal').style.display = 'flex'
}

function closeEditRoomModal() {
  document.getElementById('editRoomModal').style.display = 'none'
  document.getElementById('editRoomForm').reset()
  document.getElementById('messageEdit').className = 'message'
}