"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});
const sendVerificationEmail = async (to, token) => {
    const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify-email/${token}`;
    await transporter.sendMail({
        from: '"Website practice" <no-reply>',
        to,
        subject: 'Verify Your Email',
        html: `<p>Click the link to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendResetEmail = async (to, token) => {
    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${token}`;
    await transporter.sendMail({
        from: '"Website practice" <no-reply>',
        to,
        subject: 'Reset Your Password',
        html: `<p>Click to reset password: <a href="${resetLink}">${resetLink}</a></p><br><br><p>This link will only work in 5 minutes.</p>`
    });
};
exports.sendResetEmail = sendResetEmail;
