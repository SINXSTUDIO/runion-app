import { sendEmail } from '../src/lib/email';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Testing Email Sending system...');
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);

    const result = await sendEmail({
        to: process.env.ADMIN_EMAIL || 'szkami75@gmail.com',
        subject: 'RUNION Email Test - Resend & Fallback Verification',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #121212; color: #ffffff;">
                <h1 style="color: #00f2fe;">RUNION Email Engine Test</h1>
                <p>Ez egy teszt üzenet a RUNION email kiszolgálójából.</p>
                <p><strong>Dátum:</strong> ${new Date().toLocaleString('hu-HU')}</p>
                <p>Ha ezt az üzenetet olvasod, az email küldő rendszer tökéletesen működik!</p>
            </div>
        `,
    });

    console.log('Test Result:', result);
}

main().catch(console.error);
