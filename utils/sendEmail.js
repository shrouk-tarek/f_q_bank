const sgMail = require('@sendgrid/mail');

// تعيين API Key من متغيرات البيئة
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  console.log('Sending email via SendGrid...');
  
  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM,
    subject: subject,
    text: text,
    html: html
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid');
  } catch (error) {
    console.error('❌ SendGrid Error:', error.message);
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    throw error;
  }
}

module.exports = sendEmail;