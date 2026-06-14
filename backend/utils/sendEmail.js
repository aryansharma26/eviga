import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Eviga Pharma" <${process.env.SMTP_USER || 'noreply@evigapharma.com'}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    throw error;
  }
};

export const getWelcomeEmailTemplate = (name) => `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
    <h2 style="color:#1a4d3a;">Welcome to Eviga Pharma, ${name}!</h2>
    <p>Thank you for joining us. Start exploring genuine medicines and healthcare products.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display:inline-block;padding:12px 24px;background:#1a4d3a;color:#fff;text-decoration:none;border-radius:8px;margin-top:16px;">Shop Now</a>
  </div>
`;

export const getOrderConfirmationTemplate = (order) => `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
    <h2 style="color:#1a4d3a;">Order Confirmed!</h2>
    <p>Your order has been placed successfully.</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total:</strong> ₹${order.totalPrice}</p>
    <p><strong>Status:</strong> ${order.status}</p>
  </div>
`;

export const getPasswordResetTemplate = (resetUrl) => `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:12px;">
    <h2 style="color:#1a4d3a;">Password Reset Request</h2>
    <p>You requested a password reset. Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1a4d3a;color:#fff;text-decoration:none;border-radius:8px;margin-top:16px;">Reset Password</a>
    <p style="margin-top:16px;font-size:12px;color:#666;">If you didn't request this, please ignore this email.</p>
  </div>
`;
