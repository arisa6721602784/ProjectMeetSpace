const jwt = require('jsonwebtoken')
const UserModel = require('../models/users')

const register = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password } = req.body
    const errors = []
    if (!firstname) errors.push('กรุณากรอกชื่อ')
    if (!lastname) errors.push('กรุณากรอกนามสกุล')
    if (!email) errors.push('กรุณากรอกอีเมล')
    if (!password) errors.push('กรุณากรอกรหัสผ่าน')
    if (errors.length > 0) return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบ', errors })

    const result = await UserModel.create(req.body)
    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', userId: result.insertId })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await UserModel.findByEmail(email)
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านผิด' })
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' })
    res.json({ message: 'ล็อกอินสำเร็จ', token, user: { id: user.id, firstname: user.firstname, role: user.role } })
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const users = await UserModel.findAll()
    res.json(users)
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login, getAll }