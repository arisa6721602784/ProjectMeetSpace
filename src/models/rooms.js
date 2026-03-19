const { getConnection } = require('../config/db')

const findAll = async () => {
  const conn = await getConnection()
  const [rows] = await conn.query('SELECT * FROM rooms')
  return rows
}

const findById = async (id) => {
  const conn = await getConnection()
  const [rows] = await conn.query('SELECT * FROM rooms WHERE id = ?', [id])
  return rows[0]
}

const create = async (data) => {
  const conn = await getConnection()
  const { name, description, capacity, image_url } = data
  const [result] = await conn.query(
    'INSERT INTO rooms (name, description, capacity, image_url) VALUES (?, ?, ?, ?)',
    [name, description, capacity, image_url || null]
  )
  return result
}

const update = async (id, data) => {
  const conn = await getConnection()
  const { name, description, capacity, status, image_url } = data
  const [result] = await conn.query(
    'UPDATE rooms SET name=?, description=?, capacity=?, status=?, image_url=? WHERE id=?',
    [name, description, capacity, status, image_url, id]
  )
  return result
}

const remove = async (id) => {
  const conn = await getConnection()
  const [result] = await conn.query('DELETE FROM rooms WHERE id = ?', [parseInt(id)])
  return result
}

module.exports = { findAll, findById, create, update, remove }