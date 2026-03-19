const RoomModel = require('../models/rooms')

const getAll = async (req, res, next) => {
  try {
    const rooms = await RoomModel.findAll()
    res.json(rooms)
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const room = await RoomModel.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'ไม่พบห้องนี้' })
    res.json(room)
  } catch (error) {
    next(error)
  }
}

const create = async (req, res, next) => {
  try {
    const { name, capacity } = req.body
    const errors = []
    if (!name) errors.push('กรุณากรอกชื่อห้อง')
    if (!capacity) errors.push('กรุณากรอกความจุ')
    if (errors.length > 0) return res.status(400).json({ message: 'กรอกข้อมูลไม่ครบ', errors })

    const image_url = req.file ? `/uploads/${req.file.filename}` : null
    const result = await RoomModel.create({ ...req.body, image_url })
    res.status(201).json({ message: 'เพิ่มห้องสำเร็จ', roomId: result.insertId })
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const old = await RoomModel.findById(req.params.id)
    if (!old) return res.status(404).json({ message: 'ไม่พบห้องนี้' })

    const image_url = req.file ? `/uploads/${req.file.filename}` : old.image_url
    const finalStatus = req.body.status || old.status
    await RoomModel.update(req.params.id, {
      name: req.body.name || old.name,
      description: req.body.description || old.description,
      capacity: req.body.capacity || old.capacity,
      status: finalStatus,
      image_url
    })
    res.json({ message: 'อัปเดตข้อมูลห้องสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

const remove = async (req, res, next) => {
  try {
    await RoomModel.remove(req.params.id)
    res.json({ message: 'ลบห้องสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

module.exports = { getAll, getById, create, update, remove }