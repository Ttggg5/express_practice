import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: '"Your App" <no-reply@yourapp.com>',
    to,
    subject: 'Verify Your Email',
    html: `<p>Click the link to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`
  });
};

export const sendResetEmail = async (to: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: 'Your App <no-reply@yourapp.com>',
    to,
    subject: 'Reset Your Password',
    html: `<p>Click to reset password: <a href="${resetLink}">${resetLink}</a></p><br><br><p>This link will only work in 15 minutes.</p>`
  });
};
