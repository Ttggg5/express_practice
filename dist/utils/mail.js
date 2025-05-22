"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendVerificationEmail = async (to, token) => {
    const transporter = nodemailer_1.default.createTransport({
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
exports.sendVerificationEmail = sendVerificationEmail;
