import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateProformaPDF } from '@/lib/pdf-generator';
import { auth } from '@/auth';
import { handleError } from '@/lib/error-handler';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Security check: Ensure user is logged in and owns the registration OR is admin
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
            user: true,
            distance: {
                include: {
                    event: {
                        include: {
                            seller: true,
                            sellerEuro: true
                        }
                    }
                }
            }
        }
    });

    if (!registration) {
        return new NextResponse('Not Found', { status: 404 });
    }

    // Access control: User must own registration or be admin/staff
    if (registration.userId !== session.user.id &&
        session.user.role !== 'ADMIN' &&
        session.user.role !== 'STAFF') {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const event = registration.distance.event;
    const seller = (event as any).seller;
    const sellerEuro = (event as any).sellerEuro;

    if (!seller) {
        return new NextResponse('Seller info missing', { status: 400 });
    }

    try {
        // Type cast needed because formData is JsonValue but PDF generator expects specific shape
        const pdfArrayBuffer = await generateProformaPDF(
            registration as any,
            event,
            registration.distance as any,  // Cast needed for Decimal -> number conversion
            seller,
            'hu', // Default locale, potentially fetch from query param or user pref
            sellerEuro
        );

        // Convert Uint8Array to Buffer for NextResponse compatibility
        return new NextResponse(Buffer.from(pdfArrayBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${registration.proformaNumber || 'dijbekero'}.pdf"`,
            },
        });
    } catch (error) {
        handleError(error, 'Proforma PDF generation failed');
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
