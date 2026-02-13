
import dotenv from 'dotenv';
import path from 'path';

// Load env vars FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TARGET_EMAIL = 'szkami75@gmail.com';

async function main() {
    // Then import the lib inside async function
    const { sendEmail } = await import('../src/lib/email');

    console.log(`Sending premium test email to ${TARGET_EMAIL}...`);

    const eventName = "Balatonfüredi Téli Futófesztivál";
    const amount = 12500;
    const distanceName = "Félmaraton (21km)";
    const userName = "Tamás";

    // Premium HTML Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fizetési Emlékeztető</title>
        <style>
            body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Arial', sans-serif; -webkit-font-smoothing: antialiased; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background-color: #000000; padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; font-weight: 900; }
            .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
            .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #111111; }
            .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: center; }
            .detail-item { margin-bottom: 20px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 15px; }
            .detail-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .label { color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
            .value { font-weight: 900; color: #0f172a; font-size: 18px; line-height: 1.4; display: block; }
            .cta-button { display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: bold; margin-top: 10px; text-align: center; font-size: 16px; width: 100%; box-sizing: border-box; }
            .footer { background-color: #f4f4f5; padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e4e4e7; }
            .small-text { font-size: 13px; color: #64748b; margin-top: 20px; }
            @media only screen and (max-width: 600px) {
                .container { width: 100% !important; border-radius: 0; }
                .content { padding: 20px; }
            }
        </style>
    </head>
    <body>
        <div style="padding: 20px;">
            <div class="container">
                <div class="header">
                    <h1>RUNION</h1>
                </div>
                <div class="content">
                    <p class="greeting">Kedves ${userName}!</p>
                    <p>Köszönjük, hogy regisztráltál a közelgő versenyünkre! Rendszerünk szerint a nevezési díj befizetése még várat magára.</p>
                    
                    <div class="card">
                        <div class="detail-item">
                            <span class="label">Esemény</span>
                            <span class="value">${eventName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Választott táv</span>
                            <span class="value">${distanceName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Fizetendő összeg</span>
                            <span class="value" style="color: #ef4444;">${amount.toLocaleString('hu-HU')} Ft</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Státusz</span>
                            <span class="value" style="color: #ef4444;">Függőben</span>
                        </div>
                    </div>

                    <p>Kérjük, a nevezés véglegesítéséhez rendezd a díjat az alábbi gombra kattintva, vagy a verseny oldalán található banki adatokra történő átutalással.</p>

                    <a href="https://runion.eu/login" class="cta-button">Fizetés Rendezése</a>

                    <p class="small-text">Ha időközben már rendezted a díjat, kérjük, tekintsd tárgytalannak ezt az üzenetet. A jóváírás 1-2 munkanapot vehet igénybe.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} RUNION. Minden jog fenntartva.</p>
                    <p>Ez egy automatikus üzenet, kérjük ne válaszolj rá.</p>
                    <p><a href="#" style="color: #94a3b8; text-decoration: underline;">Leiratkozás</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await sendEmail({
            to: TARGET_EMAIL,
            subject: "⚠️ Fizetési Emlékeztető - " + eventName,
            html: htmlContent
        });
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

main().catch(console.error);
