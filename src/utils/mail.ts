import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  });

  const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: '"Your App" <no-reply@yourapp.com>',
    to,
    subject: 'Verify Your Email',
    html: `<p>Click the link to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`
  });
};
