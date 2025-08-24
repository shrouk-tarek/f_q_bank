const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, text, html }) {
  // You can use Gmail, Outlook, or any SMTP provider
  // For Gmail, you need to enable 'Less secure app access' or use an App Password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or app password
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
