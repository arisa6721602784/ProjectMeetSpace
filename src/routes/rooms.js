const express = require('express')
const router = express.Router()
const controller = require('../controllers/rooms')
const { verifyToken, verifyAdmin } = require('../middlewares/auth')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, 'room-' + Date.now() + path.extname(file.originalname))
})
const upload = multer({ storage })

router.get('/', controller.getAll)
router.get('/:id', controller.getById)
router.post('/', verifyToken, verifyAdmin, upload.single('image'), controller.create)
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), controller.update)
router.delete('/:id', verifyToken, verifyAdmin, controller.remove)

module.exports = router