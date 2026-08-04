import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Secret Key to block unauthorized webhook calls
        const authHeader = req.headers.get('x-wp-sync-secret') || req.headers.get('authorization');
        const expectedSecret = process.env.WP_SYNC_SECRET || 'runion_wp_sync_secret_key_2026';

        if (authHeader !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
        }

        const body = await req.json();

        // Support single item or bulk array payloads
        const items = Array.isArray(body) ? body : [body];
        let processedCount = 0;
        let errorsCount = 0;

        for (const item of items) {
            try {
                const email = item.email?.trim()?.toLowerCase();
                if (!email) {
                    errorsCount++;
                    continue;
                }

                const firstName = item.firstName || item.first_name || item.name?.split(' ')[1] || 'Futó';
                const lastName = item.lastName || item.last_name || item.name?.split(' ')[0] || 'RUNION';
                const phoneNumber = item.phoneNumber || item.phone || item.telefonszam || null;
                const birthDateRaw = item.birthDate || item.birth_date || item.szuletesi_datum || null;
                const gender = item.gender === 'FÉRFI' || item.gender === 'MALE' ? 'MALE' : item.gender === 'NŐ' || item.gender === 'FEMALE' ? 'FEMALE' : null;
                const clubName = item.clubName || item.club || item.egyesulet || null;
                const tshirtSize = item.tshirtSize || item.tshirt || item.polomeret || null;
                const city = item.city || item.varos || null;
                const zipCode = item.zipCode || item.iranyitoszam || null;
                const address = item.address || item.cim || null;
                const emergencyContactName = item.emergencyContactName || item.surgossegi_nev || null;
                const emergencyContactPhone = item.emergencyContactPhone || item.surgossegi_telefon || null;
                const fiveTrialsId = item.fiveTrialsId || item.otproba_id || null;
                const isVegetarian = Boolean(item.isVegetarian || item.vegetarianus);

                let birthDate: Date | null = null;
                if (birthDateRaw) {
                    const parsed = new Date(birthDateRaw);
                    if (!isNaN(parsed.getTime())) {
                        birthDate = parsed;
                    }
                }

                // 2. Find or Create User
                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            firstName,
                            lastName,
                            phoneNumber,
                            birthDate,
                            gender,
                            clubName,
                            tshirtSize,
                            city,
                            zipCode,
                            address,
                            emergencyContactName,
                            emergencyContactPhone,
                            fiveTrialsId,
                            isVegetarian,
                            role: 'USER',
                        },
                    });
                } else {
                    // Update profile fields if new data is provided
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            firstName: user.firstName || firstName,
                            lastName: user.lastName || lastName,
                            phoneNumber: user.phoneNumber || phoneNumber,
                            birthDate: user.birthDate || birthDate,
                            gender: user.gender || gender,
                            clubName: user.clubName || clubName,
                            tshirtSize: user.tshirtSize || tshirtSize,
                            city: user.city || city,
                            zipCode: user.zipCode || zipCode,
                            address: user.address || address,
                            emergencyContactName: user.emergencyContactName || emergencyContactName,
                            emergencyContactPhone: user.emergencyContactPhone || emergencyContactPhone,
                            fiveTrialsId: user.fiveTrialsId || fiveTrialsId,
                        },
                    });
                }

                // 3. Match or Create Event & Distance
                const eventTitle = item.eventName || item.event_title || 'RUNION Futóverseny';
                const distanceName = item.distanceName || item.distance || 'Alap táv';
                const pricePaid = Number(item.pricePaid || item.price || 0);

                // Find event by title or slug
                let event = await prisma.event.findFirst({
                    where: {
                        OR: [
                            { title: { contains: eventTitle, mode: 'insensitive' } },
                            { slug: { contains: eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'), mode: 'insensitive' } }
                        ]
                    }
                });

                if (!event) {
                    // Create default event if not found
                    event = await prisma.event.create({
                        data: {
                            title: eventTitle,
                            slug: `wp-event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            description: 'WordPress oldalról átvett esemény',
                            location: 'Balatonfüred',
                            eventDate: new Date(),
                            regDeadline: new Date(Date.now() + 8640000000),
                            organizerId: user.id,
                            status: 'PUBLISHED',
                        }
                    });
                }

                // Find or create distance
                let distance = await prisma.distance.findFirst({
                    where: {
                        eventId: event.id,
                        name: { contains: distanceName, mode: 'insensitive' }
                    }
                });

                if (!distance) {
                    distance = await prisma.distance.create({
                        data: {
                            eventId: event.id,
                            name: distanceName,
                            price: pricePaid || 5000,
                            capacityLimit: 500,
                            startTime: new Date(),
                        }
                    });
                }

                // 4. Check if registration already exists to prevent duplicate entries
                const existingReg = await prisma.registration.findFirst({
                    where: {
                        userId: user.id,
                        distanceId: distance.id
                    }
                });

                if (!existingReg) {
                    await prisma.registration.create({
                        data: {
                            userId: user.id,
                            distanceId: distance.id,
                            registrationStatus: 'CONFIRMED',
                            paymentStatus: item.paymentStatus === 'PENDING' ? 'UNPAID' : 'PAID',
                            formData: {
                                wp_imported: true,
                                imported_at: new Date().toISOString(),
                                original_data: item
                            }
                        }
                    });
                }

                processedCount++;
            } catch (err) {
                console.error('[WP Webhook] Error processing item:', err);
                errorsCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${processedCount} entries with ${errorsCount} errors.`,
            processedCount,
            errorsCount
        });

    } catch (error) {
        console.error('[WP Webhook] Fatal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
