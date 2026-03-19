const app = require('./src/app')
const { getConnection } = require('./src/config/db')

const port = process.env.PORT || 8000

app.listen(port, async () => {
  try {
    await getConnection()
    console.log('Connected to MySQL database')
  } catch (err) {
    console.error('Database connection failed:', err.message)
  }
  console.log('MeetSpace Backend running at http://localhost:' + port)
})
