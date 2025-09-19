const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const testSendGrid = async () => {
  console.log('🧪 Testing SendGrid configuration...\n');
  
  console.log('📋 Environment Variables:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set ✅' : 'Not Set ❌');
  console.log('SENDGRID_FROM:', process.env.SENDGRID_FROM || 'Not Set ❌');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('\n❌ SENDGRID_API_KEY is not set in .env file');
    console.log('Please add your SendGrid API key to the .env file');
    return;
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: process.env.SENDGRID_FROM, // إرسال لنفس الإيميل للاختبار
    from: process.env.SENDGRID_FROM,
    subject: 'Test Email - Questions Bank (SendGrid Only)',
    text: 'This is a test email to verify SendGrid configuration.',
    html: `
      <h1>🔐 Questions Bank - SendGrid Test</h1>
      <p>This is a test email to verify SendGrid configuration.</p>
      <p><strong>From:</strong> ${process.env.SENDGRID_FROM}</p>
      <p><strong>Status:</strong> SendGrid working correctly! ✅</p>
      <hr>
      <small>Password reset feature is ready to use 🚀</small>
    `
  };

  try {
    console.log('\n📤 Sending test email...');
    await sgMail.send(msg);
    console.log('✅ Test email sent successfully via SendGrid!');
    console.log('🚀 Password reset feature is ready to use.');
  } catch (error) {
    console.error('\n❌ SendGrid error:', error.message);
    
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    
    console.log('\n💡 Possible solutions:');
    console.log('- Check if SENDGRID_API_KEY is correct');
    console.log('- Verify sender email in SendGrid dashboard');
    console.log('- Ensure API key has Mail Send permissions');
  }
};

testSendGrid();