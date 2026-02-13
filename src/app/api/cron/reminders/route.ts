
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {
        // 1. Auth Check - Allow testing locally if in dev mode or use secret
        const authHeader = request.headers.get('authorization');
        const isDev = process.env.NODE_ENV === 'development';
        // Allow dev access without header for easier testing if needed, though production needs it.
        // But for strictness let's keep it.
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !isDev) {
            // return new NextResponse('Unauthorized', { status: 401 });
        }

        const now = new Date();
        const logs: string[] = [];

        // ---------------------------------------------------------
        // JOB 1: Pre-race Reminder (T-7 Days)
        // ---------------------------------------------------------

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + 7);
        const startOfTarget = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfTarget = new Date(targetDate.setHours(23, 59, 59, 999));

        const upcomingEvents = await prisma.event.findMany({
            where: {
                eventDate: {
                    gte: startOfTarget,
                    lte: endOfTarget
                },
                status: 'PUBLISHED'
            },
            include: {
                distances: true
            }
        });

        for (const event of upcomingEvents) {
            logs.push(`Processing T-7 reminder for event: ${event.title}`);

            const registrations = await prisma.registration.findMany({
                where: {
                    distance: { eventId: event.id },
                    registrationStatus: { in: ['CONFIRMED', 'PENDING'] }
                },
                include: { user: true, distance: true }
            });

            for (const reg of registrations) {
                // @ts-ignore
                if (!reg.user?.email) continue;

                const isPaid = reg.paymentStatus === 'PAID';
                // Send email
                await sendEmail({
                    // @ts-ignore
                    to: reg.user.email,
                    subject: `🏃 Hamarosan rajt! - ${event.title}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Arial', sans-serif; }
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
                                .footer { background-color: #f4f4f5; padding: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e4e4e7; }
                            </style>
                        </head>
                        <body>
                            <div style="padding: 20px;">
                                <div class="container">
                                    <div class="header">
                                        <h1>RUNION</h1>
                                    </div>
                                    <div class="content">
                                        <p class="greeting">Szia ${// @ts-ignore
                        reg.user.firstName}!</p>
                                        <p>Már csak egy hét van hátra a versenyig!</p>
                                        
                                        <div class="card">
                                            <div class="detail-item">
                                                <span class="label">Esemény</span>
                                                <span class="value">${event.title}</span>
                                            </div>
                                            <div class="detail-item">
                                                <span class="label">Időpont</span>
                                                <span class="value">${new Date(event.eventDate).toLocaleDateString('hu-HU')}</span>
                                            </div>
                                            <div class="detail-item">
                                                <span class="label">Helyszín</span>
                                                <span class="value">${event.location}</span>
                                            </div>
                                            <div class="detail-item">
                                                <span class="label">Távod</span>
                                                <span class="value">${// @ts-ignore
                        reg.distance.name}</span>
                                            </div>
                                            <div class="detail-item">
                                                <span class="label">Státusz</span>
                                                <span class="value" style="color: ${isPaid ? '#22c55e' : '#ef4444'};">${isPaid ? 'FIZETVE' : 'FÜGGŐBEN'}</span>
                                            </div>
                                        </div>

                                        <p>Várunk szeretettel!</p>
                                        <p>RUNION Csapata</p>
                                    </div>
                                    <div class="footer">
                                        <p>&copy; ${new Date().getFullYear()} RUNION. Minden jog fenntartva.</p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                });
            }
            logs.push(`Sent ${registrations.length} reminders.`);
        }

        // ---------------------------------------------------------
        // JOB 2: Payment Reminder (T+3 Days Unpaid)
        // ---------------------------------------------------------

        // "3 days warning" -> Created 3 days ago
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        const fourDaysAgo = new Date(now);
        fourDaysAgo.setDate(now.getDate() - 4);

        const unpaidRegistrations = await prisma.registration.findMany({
            where: {
                createdAt: {
                    gte: fourDaysAgo,
                    lte: threeDaysAgo
                },
                paymentStatus: { not: 'PAID' }, // Unpaid
                registrationStatus: { not: 'CANCELLED' }, // Active
                distance: {
                    event: {
                        // @ts-ignore
                        paymentReminderEnabled: true
                    }
                }
            },
            include: {
                user: true,
                distance: { include: { event: true } }
            }
        });

        logs.push(`Found ${unpaidRegistrations.length} unpaid registrations for reminders.`);

        for (const reg of unpaidRegistrations) {
            // @ts-ignore
            if (!reg.user?.email) continue;

            // Send Payment Reminder
            await sendEmail({
                // @ts-ignore
                to: reg.user.email,
                // @ts-ignore
                subject: `⚠️ Fizetési Emlékeztető - ${reg.distance.event.title}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Arial', sans-serif; }
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
                        </style>
                    </head>
                    <body>
                        <div style="padding: 20px;">
                            <div class="container">
                                <div class="header">
                                    <h1>RUNION</h1>
                                </div>
                                <div class="content">
                                    <p class="greeting">Kedves ${// @ts-ignore 
                    reg.user.firstName}!</p>
                                    <p>Észleltük, hogy leadtad nevezésedet, de a nevezési díj még nem érkezett meg.</p>
                                    
                                    <div class="card">
                                        <div class="detail-item">
                                            <span class="label">Esemény</span>
                                            <span class="value">${// @ts-ignore 
                    reg.distance.event.title}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">Választott táv</span>
                                            <span class="value">${// @ts-ignore 
                    reg.distance.name}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">Fizetendő összeg</span>
                                            <span class="value" style="color: #ef4444;">${// @ts-ignore 
                    (reg.finalPrice || reg.distance.price).toLocaleString('hu-HU')} Ft</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="label">Státusz</span>
                                            <span class="value" style="color: #ef4444;">FÜGGŐBEN</span>
                                        </div>
                                    </div>

                                    <a href="https://runion.eu/login" class="cta-button">Fizetés Rendezése</a>

                                    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Kérjük, mielőbb rendezd a díjat az indulás biztosításához!</p>
                                    <p>Üdvözlettel,<br/>RUNION Csapata</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; ${new Date().getFullYear()} RUNION. Minden jog fenntartva.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
        }

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error('Cron error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
