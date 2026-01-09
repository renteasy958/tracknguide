
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { Buffer } from 'buffer';

// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// POST /send-student-qr

// POST /send-student-qr-link
app.post('/send-student-qr-link', async (req, res) => {
  let { name, email, qrData } = req.body;
  console.log('Received request to /send-student-qr-link:', req.body);
  name = typeof name === 'string' ? name.trim() : '';
  email = typeof email === 'string' ? email.trim() : '';
  qrData = typeof qrData === 'string' ? qrData.trim() : '';
  console.log('Trimmed name:', name);
  console.log('Trimmed email:', email);
  console.log('Trimmed qrData:', qrData);
  const missing = [];
  if (!name) missing.push('name');
  if (!email) missing.push('email');
  if (!qrData) missing.push('qrData');
  if (missing.length > 0) {
    console.log('Missing required fields:', missing);
    return res.status(400).json({ error: 'Missing required fields', missing, received: { name, email, qrData } });
  }

  try {
    // Generate QR code image as Data URL
    const qrImageDataUrl = await QRCode.toDataURL(qrData);
    // Convert Data URL to Buffer for attachment
    const base64Data = qrImageDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrImageBuffer = Buffer.from(base64Data, 'base64');

    // Email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your Personal QR Code',
      html: `<p>This is your personal QR code. Use this in timein and timeout.</p>
             <p>Scan the attached QR code image with the Track & Guide system.</p>`,
      attachments: [
        {
          filename: 'qr-code.png',
          content: qrImageBuffer,
          contentType: 'image/png'
        }
      ]
    };
    console.log('Sending QR code image email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return res.json({ success: true });
  } catch (error) {
    console.log('Nodemailer error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
