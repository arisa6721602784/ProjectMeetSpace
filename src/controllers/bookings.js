const BookingModel = require('../models/bookings')
const { getConnection } = require('../config/db')
const sendBookingEmail = require('../services/mailer')

const getAll = async (req, res, next) => {
  try {
    const bookings = await BookingModel.findAll()
    res.json(bookings)
  } catch (error) {
    next(error)
  }
}

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.findByUserId(req.user.id)
    res.json(bookings)
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    const { room_id, start_time, end_time } = req.body
    const errors = []
    if (!room_id) errors.push('กรุณาระบุห้อง')
    if (!start_time) errors.push('กรุณาระบุเวลาเริ่ม')
    if (!end_time) errors.push('กรุณาระบุเวลาสิ้นสุด')
    if (errors.length > 0) return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบ', errors })

    const conflicts = await BookingModel.findConflicts(room_id, start_time, end_time)
    if (conflicts.length > 0) return res.status(409).json({ message: 'เวลาทับซ้อน ห้องถูกจองแล้ว' })

    const result = await BookingModel.create({ ...req.body, user_id: req.user.id })

    try {
      const conn = await getConnection()
      const [[userInfo]] = await conn.query('SELECT firstname, email FROM users WHERE id = ?', [req.user.id])
      const [[roomInfo]] = await conn.query('SELECT name FROM rooms WHERE id = ?', [room_id])
      if (userInfo?.email) {
        await sendBookingEmail(userInfo.email, {
          userName: userInfo.firstname,
          roomName: roomInfo.name,
          startTime: start_time,
          endTime: end_time
        })
      }
    } catch (mailError) {
      console.error('Email Error:', mailError)
    }

    res.status(201).json({ message: 'จองห้องสำเร็จ และระบบกำลังส่งอีเมลยืนยันครับ', bookingId: result.insertId })
  } catch (error) {
    next(error)
  }
}

const remove = async (req, res, next) => {
  try {
    await BookingModel.remove(req.params.id, req.user.id)
    res.json({ message: 'ยกเลิกการจองสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

module.exports = { getAll, getMyBookings, create, remove }