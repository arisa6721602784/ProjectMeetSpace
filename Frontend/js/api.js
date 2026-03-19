const BASE_URL = 'http://localhost:8000'

const api = {
  users: {
    register: (data) => axios.post(`${BASE_URL}/api/users/register`, data),
    login: (data) => axios.post(`${BASE_URL}/api/users/login`, data),
    getAll: (token) => axios.get(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  },
  rooms: {
    getAll: () => axios.get(`${BASE_URL}/api/rooms`),
    getById: (id) => axios.get(`${BASE_URL}/api/rooms/${id}`),
    create: (formData, token) => axios.post(`${BASE_URL}/api/rooms`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    update: (id, formData, token) => axios.put(`${BASE_URL}/api/rooms/${id}`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    remove: (id, token) => axios.delete(`${BASE_URL}/api/rooms/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  },
  bookings: {
    getAll: (token) => axios.get(`${BASE_URL}/api/admin/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    getMyBookings: (token) => axios.get(`${BASE_URL}/api/my-bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    create: (data, token) => axios.post(`${BASE_URL}/api/bookings`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    remove: (id, token) => axios.delete(`${BASE_URL}/api/bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
  }
}