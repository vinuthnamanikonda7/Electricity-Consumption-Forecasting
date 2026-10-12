/**
 * Brevo (formerly Sendinblue) Transactional Email Service
 * Electricity Consumption Forecasting System
 */

/**
 * Send OTP Verification Email using Brevo REST API
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit numeric OTP code
 * @param {string} purpose - Purpose of OTP ('registration', 'login', 'verification')
 * @param {string} userName - Optional user's name
 */
const sendOtpEmail = async (email, otp, purpose = 'registration', userName = '') => {
  const cleanEmail = email.toLowerCase().trim();
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  console.log(`\n======================================================`);
  console.log(`🔐 [BREVO EMAIL OTP DISPATCH]`);
  console.log(`📧 Destination: ${cleanEmail}`);
  console.log(`🔢 6-Digit OTP Code: ${otp}`);
  console.log(`⏳ Purpose: ${purpose.toUpperCase()}`);
  console.log(`======================================================`);

  if (!apiKey || apiKey.trim() === '') {
    console.warn(`⚠️ [BREVO WARNING] BREVO_API_KEY is not configured in backend/.env`);
    return {
      success: true,
      sentViaBrevo: false,
      message: 'OTP logged to console (BREVO_API_KEY missing).'
    };
  }

  const subjectTitle = purpose === 'login' 
    ? `${otp} is your Login Verification Code - Electricity Forecasting` 
    : `${otp} is your Household Verification Code - Electricity Forecasting`;

  const actionText = purpose === 'login'
    ? 'sign in to your household dashboard'
    : 'verify and complete your household account registration';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subjectTitle}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0f172a;
          margin: 0;
          padding: 24px;
          color: #1e293b;
        }
        .container {
          max-width: 540px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #059669, #0d9488, #0f172a);
          padding: 36px 24px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 8px 0 0;
          font-size: 14px;
          color: #a7f3d0;
        }
        .content {
          padding: 32px 28px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .description {
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }
        .otp-box {
          background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
          border: 2px dashed #10b981;
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #047857;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .otp-code {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 10px;
          color: #065f46;
          font-family: 'Courier New', Courier, monospace;
          display: inline-block;
          padding: 4px 12px;
        }
        .expiry-badge {
          display: inline-block;
          margin-top: 12px;
          font-size: 12px;
          color: #b45309;
          font-weight: 600;
          background: #fef3c7;
          padding: 5px 12px;
          border-radius: 20px;
        }
        .security-note {
          font-size: 13px;
          color: #475569;
          background: #f8fafc;
          border-left: 4px solid #10b981;
          padding: 12px 16px;
          border-radius: 6px;
          margin-top: 24px;
          line-height: 1.5;
        }
        .footer {
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 20px 24px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ Electricity Forecasting System</h1>
          <p>Smart Energy Analytics & Consumption Optimization</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName ? userName : 'Resident'},</div>
          <p class="description">
            You requested a verification code to ${actionText}. Enter the 6-digit code below to proceed:
          </p>
          
          <div class="otp-box">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">${otp}</div>
            <br>
            <div class="expiry-badge">⏱️ Valid for 15 minutes</div>
          </div>

          <div class="security-note">
            🛡️ <strong>Security Tip:</strong> Never share this verification code with anyone. Our team will never ask for your code.
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message from the Electricity Consumption Forecasting System.</p>
          <p>If you did not request this verification code, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [
          {
            email: cleanEmail,
            name: userName || 'Resident'
          }
        ],
        subject: subjectTitle,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [BREVO ERROR] Status ${response.status}:`, data);
      return {
        success: false,
        sentViaBrevo: false,
        error: data.message || `Brevo Error (${response.status})`
      };
    }

    console.log(`✅ [BREVO SUCCESS] Email dispatched successfully to ${cleanEmail}! MessageId: ${data.messageId}\n`);
    return {
      success: true,
      sentViaBrevo: true,
      messageId: data.messageId
    };
  } catch (error) {
    console.error(`❌ [BREVO EXCEPTION]:`, error.message);
    return {
      success: false,
      sentViaBrevo: false,
      error: error.message
    };
  }
};

module.exports = {
  sendOtpEmail
};
