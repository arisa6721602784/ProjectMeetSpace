const { getConnection } = require('../config/db')

const findAll = async () => {
  const conn = await getConnection()
  const [rows] = await conn.query(`
    SELECT b.id, b.start_time, b.end_time, b.status,
           r.name AS room_name,
           u.firstname, u.lastname, u.email
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.start_time DESC
  `)
  return rows
}

const findByUserId = async (user_id) => {
  const conn = await getConnection()
  const [rows] = await conn.query(
    `SELECT b.*, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.user_id = ?`,
    [user_id]
  )
  return rows
}

const findConflicts = async (room_id, start_time, end_time) => {
  const conn = await getConnection()
  const [rows] = await conn.query(
    `SELECT id FROM bookings WHERE room_id = ? AND status = 'confirmed' AND (start_time < ? AND end_time > ?)`,
    [room_id, end_time, start_time]
  )
  return rows
}

const create = async (data) => {
  const conn = await getConnection()
  const { room_id, user_id, start_time, end_time } = data
  const [result] = await conn.query(
    'INSERT INTO bookings (room_id, user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, "confirmed")',
    [room_id, user_id, start_time, end_time]
  )
  return result
}

const remove = async (id, user_id) => {
  const conn = await getConnection()
  const [result] = await conn.query(
    'UPDATE bookings SET status = "cancelled" WHERE id = ? AND user_id = ?',
    [id, user_id]
  )
  return result
}

module.exports = { findAll, findByUserId, findConflicts, create, remove }