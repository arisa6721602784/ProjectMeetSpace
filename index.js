require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. ตั้งค่าการอัปโหลดไฟล์ (Multer)
// ==========================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'room-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// ==========================================
// 2. เชื่อมต่อฐานข้อมูล (Database Connection)
// ==========================================
// ใช้ Pool แบบที่ทำงานได้เสถียรกว่า (รองรับคนเข้าพร้อมกันเยอะๆ)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// ==========================================
// 3. Middlewares (ตัวตรวจสอบสิทธิ์)
// ==========================================
// ตรวจสอบว่า Login หรือยัง
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(403).json({ message: 'กรุณาล็อกอินก่อน' });
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token ไม่ถูกต้อง' });
        req.user = decoded; 
        next();
    });
};

// ตรวจสอบว่าเป็น Admin หรือไม่
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'สิทธิ์สำหรับ Admin เท่านั้น' });
    }
    next();
};

// ==========================================
// 🟢 4.1 ROUTES: USERS (ระบบผู้ใช้งาน)
// ==========================================
// [POST] สมัครสมาชิก
app.post('/api/register', async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        const [result] = await db.query(
            'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
            [firstname, lastname, email, password]
        );
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [POST] ล็อกอิน
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (users.length === 0) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านผิด' });

        const user = users[0];
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ message: 'ล็อกอินสำเร็จ', token, user: { id: user.id, firstname: user.firstname, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [GET] ดึงข้อมูล User ทั้งหมด (Admin เท่านั้น)
app.get('/api/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, firstname, lastname, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 🔵 4.2 ROUTES: ROOMS (ระบบห้องประชุม)
// ==========================================
// [GET] ดึงห้องทั้งหมด (ทุกคนดูได้)
app.get('/api/rooms', async (req, res) => {
    try {
        const [rooms] = await db.query('SELECT * FROM rooms');
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [GET] ดึงห้องตาม ID
app.get('/api/rooms/:id', async (req, res) => {
    try {
        const [rooms] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
        if (rooms.length === 0) return res.status(404).json({ message: 'ไม่พบห้องนี้' });
        res.json(rooms[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [POST] เพิ่มห้องใหม่ (Admin เท่านั้น + แนบรูปได้)
app.post('/api/rooms', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, capacity } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        const [result] = await db.query(
            'INSERT INTO rooms (name, description, capacity, image_url) VALUES (?, ?, ?, ?)',
            [name, description, capacity, image_url]
        );
        res.status(201).json({ message: 'เพิ่มห้องสำเร็จ', roomId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [PUT] แก้ไขข้อมูลห้อง (Admin เท่านั้น)
app.put('/api/rooms/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const roomId = req.params.id;
        const { name, description, capacity, status } = req.body;

        // ถ้าส่งมาแค่ status (เช่นจากหน้า Admin จัดการสถานะ)
        if (status && !name) {
            await db.query('UPDATE rooms SET status = ? WHERE id = ?', [status, roomId]);
            return res.json({ message: 'อัปเดตสถานะสำเร็จ' });
        }

        // ถ้าส่งมาครบ (เช่นจากหน้าแก้ไขฟอร์มห้อง)
        await db.query(
            'UPDATE rooms SET name=?, description=?, capacity=?, status=? WHERE id=?',
            [name, description, capacity, status, roomId]
        );
        res.json({ message: 'อัปเดตข้อมูลห้องสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [DELETE] ลบห้อง (Admin เท่านั้น)
app.delete('/api/rooms/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
        res.json({ message: 'ลบห้องสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 🟠 4.3 ROUTES: BOOKINGS (ระบบการจองห้อง)
// ==========================================

// 🌟 [เพิ่มใหม่ตรงนี้] ดูประวัติการจองทั้งหมด (Admin เท่านั้น)
app.get('/api/admin/bookings', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const query = `
            SELECT b.id, b.start_time, b.end_time, b.status, 
                   r.name AS room_name, 
                   u.firstname, u.lastname, u.email 
            FROM bookings b 
            JOIN rooms r ON b.room_id = r.id 
            JOIN users u ON b.user_id = u.id 
            ORDER BY b.start_time DESC
        `;
        const [bookings] = await db.query(query);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [POST] จองห้องประชุม (User) + เช็คการทับซ้อน (Conflict)
app.post('/api/bookings', verifyToken, async (req, res) => {
    try {
        const { room_id, start_time, end_time } = req.body;
        const user_id = req.user.id;

        // ดึงข้อมูลเช็ค Conflict
        const [conflicts] = await db.query(
            `SELECT id FROM bookings WHERE room_id = ? AND status = 'confirmed' AND (start_time < ? AND end_time > ?)`,
            [room_id, end_time, start_time]
        );

        if (conflicts.length > 0) return res.status(409).json({ message: 'เวลาทับซ้อน ห้องถูกจองแล้ว' });

        const [result] = await db.query(
            'INSERT INTO bookings (room_id, user_id, start_time, end_time, status) VALUES (?, ?, ?, ?, "confirmed")',
            [room_id, user_id, start_time, end_time]
        );
        res.status(201).json({ message: 'จองห้องสำเร็จ', bookingId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [GET] ดูประวัติการจองของตัวเอง (User)
app.get('/api/my-bookings', verifyToken, async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, r.name as room_name FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.user_id = ?`,
            [req.user.id]
        );
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [DELETE] ยกเลิกการจองของตัวเอง (User)
app.delete('/api/bookings/:id', verifyToken, async (req, res) => {
    try {
        await db.query('UPDATE bookings SET status = "cancelled" WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'ยกเลิกการจองสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. สั่ง Run Server
// ==========================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
    // โค้ดสำหรับ Test Connection ว่าต่อ DB ติดไหม (เหมือนในตัวอย่างที่อาจารย์คุณสอน)
    try {
        await db.getConnection();
        console.log('✅ Connected to MySQL database');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
    console.log(`🚀 MeetSpace Backend is running on http://localhost:${PORT}`);
});