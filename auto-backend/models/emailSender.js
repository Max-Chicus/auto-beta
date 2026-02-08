const nodemailer = require('nodemailer');

// Configurează transporter-ul
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Funcție pentru trimitere email
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Setări default
    const from = process.env.EMAIL_FROM || 'service@atelierauto.ro';
    
    const mailOptions = {
      from: `"Service Auto" <${from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email trimis către: ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('❌ Eroare la trimitere email:', error);
    throw error;
  }
};

module.exports = sendEmail;