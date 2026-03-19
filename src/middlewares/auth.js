const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (!bearerHeader) return res.status(403).json({ message: 'กรุณาล็อกอินก่อน' })
  const token = bearerHeader.split(' ')[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token ไม่ถูกต้อง' })
    req.user = decoded
    next()
  })
}

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'สิทธิ์สำหรับ Admin เท่านั้น' })
  }
  next()
}

module.exports = { verifyToken, verifyAdmin }
