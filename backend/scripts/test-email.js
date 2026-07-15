require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log('📬 Attempting to send test SMTP email...');
console.log('User:', process.env.EMAIL_USER);
console.log('Service:', process.env.EMAIL_SERVICE || 'gmail');

const mailOptions = {
  from: process.env.EMAIL_FROM || `CampusFind <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: 'CampusFind SMTP Test Connection',
  text: 'If you receive this email, your SMTP configuration is 100% correct!'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ SMTP Connection Error Stack:');
    console.error(error);
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection SUCCESS!');
    console.log('Response:', info.response);
    process.exit(0);
  }
});
