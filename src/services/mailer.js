const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. ตั้งค่าพนักงานส่งเมล
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // ดึงอีเมลจาก .env
        pass: process.env.EMAIL_PASS  // ดึงรหัส 16 หลักจาก .env
    }
});

// 2. ฟังก์ชันสำหรับส่งเมล
const sendBookingEmail = async (userEmail, bookingDetails) => {
    const mailOptions = {
        from: `"MeetSpace" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'ยืนยันการจองสำเร็จ!',
        html: `<h1>จองสำเร็จแล้ว!</h1>
               <p>คุณจองห้อง: ${bookingDetails.roomName}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('ส่งเมลสำเร็จแล้ว!');
    } catch (error) {
        console.log('ส่งเมลไม่สำเร็จ:', error);
    }
};

module.exports = sendBookingEmail;