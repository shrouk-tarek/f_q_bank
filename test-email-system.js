const sendEmail = require('./utils/sendEmail');
require('dotenv').config();

const testEmailSystem = async () => {
  console.log('🧪 Testing Questions Bank Email System...\n');
  
  // فحص المتغيرات
  console.log('📋 Environment Variables:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set ✅' : 'Not Set ❌');
  console.log('SENDGRID_FROM:', process.env.SENDGRID_FROM || 'Not Set ❌');
  
  console.log('\n🔄 Email Provider: SendGrid Only');
  
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM) {
    console.log('\n❌ Missing SendGrid configuration!');
    console.log('Please ensure SENDGRID_API_KEY and SENDGRID_FROM are set in .env file');
    return;
  }
  
  // اختبار إرسال إيميل
  try {
    console.log('\n📤 Sending test email...');
    
    await sendEmail({
      to: process.env.SENDGRID_FROM, // إرسال للإيميل نفسه للاختبار
      subject: '🔐 Questions Bank - Password Reset System Test',
      text: 'This is a test email for the password reset system using SendGrid only.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">🔐 Questions Bank</h1>
          <h2 style="color: #27ae60;">Password Reset System Test</h2>
          <p>This is a test email for the Questions Bank password reset system.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>✅ Provider:</strong> SendGrid</p>
            <p><strong>✅ Status:</strong> System working correctly!</p>
            <p><strong>✅ From:</strong> ${process.env.SENDGRID_FROM}</p>
          </div>
          <p style="color: #27ae60;"><strong>🚀 Password reset feature is ready to use!</strong></p>
          <hr>
          <p style="font-size: 12px; color: #7f8c8d;">
            Available endpoints:<br>
            • POST /api/auth/forgot-password<br>
            • POST /api/auth/reset-password/:token
          </p>
        </div>
      `
    });
    
    console.log('\n✅ Email system is working correctly!');
    console.log('🚀 Password reset feature is ready to use.');
    console.log('\n📋 Available endpoints:');
    console.log('• POST /api/auth/forgot-password');
    console.log('• POST /api/auth/reset-password/:token');
    
  } catch (error) {
    console.error('\n❌ Email system error:', error.message);
    console.log('\n💡 Solutions:');
    console.log('- Check SendGrid API key is correct');
    console.log('- Verify sender email in SendGrid dashboard');
    console.log('- Ensure API key has Mail Send permissions');
  }
};

testEmailSystem();