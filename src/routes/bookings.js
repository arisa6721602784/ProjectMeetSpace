const express = require('express')
const router = express.Router()
const controller = require('../controllers/bookings')
const { verifyToken, verifyAdmin } = require('../middlewares/auth')

router.get('/admin/bookings', verifyToken, verifyAdmin, controller.getAll)
router.post('/bookings', verifyToken, controller.create)
router.get('/my-bookings', verifyToken, controller.getMyBookings)
router.delete('/bookings/:id', verifyToken, controller.remove)

module.exports = router