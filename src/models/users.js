const { getConnection } = require('../config/db')

const findAll = async () => {
  const conn = await getConnection()
  const [rows] = await conn.query('SELECT id, firstname, lastname, email, role, created_at FROM users')
  return rows
}

const findByEmail = async (email) => {
  const conn = await getConnection()
  const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0]
}

const create = async (data) => {
  const conn = await getConnection()
  const { firstname, lastname, email, password } = data
  const [result] = await conn.query(
    'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
    [firstname, lastname, email, password]
  )
  return result
}

module.exports = { findAll, findByEmail, create }