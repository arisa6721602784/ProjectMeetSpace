require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const errorHandler = require('./middlewares/errorHandler')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/users', require('./routes/users'))
app.use('/api/rooms', require('./routes/rooms'))
app.use('/api', require('./routes/bookings'))

app.use(errorHandler)

module.exports = app
