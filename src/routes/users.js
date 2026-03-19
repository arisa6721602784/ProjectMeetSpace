const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')
const { verifyToken, verifyAdmin } = require('../middlewares/auth')

router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/', verifyToken, verifyAdmin, controller.getAll)

module.exports = router