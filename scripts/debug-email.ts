
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from current directory
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (result.error) {
    console.error('Error loading .env file:', result.error);
}

console.log('--- Email Configuration Debug ---');
console.log('Current Directory:', process.cwd());
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'UNDEFINED');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('---------------------------------');

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = Number(process.env.EMAIL_PORT) || 465;
const secure = port === 465; // Auto-detect secure

console.log(`Creating transporter with: Host=${host}, Port=${port}, Secure=${secure}`);

const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true, // Enable debug logs
    logger: true // Log to console
});

async function verify() {
    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Server is ready to take our messages');

        // Try sending
        console.log('Attempting to send email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: 'szkami75@gmail.com',
            subject: 'RUNION Test Email (Debug)',
            text: 'This is a test email to verify credentials.',
        });
        console.log('Message sent: %s', info.messageId);

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verify();
