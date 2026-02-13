
import { NextRequest, NextResponse } from 'next/server';
import { generateProformaPDF } from '@/lib/pdf-generator';
import fs from 'fs';

export async function GET(request: NextRequest) {
    try {
        // Mock data usually found in DB
        const mockSeller = {
            id: 'mock-seller-id',
            name: 'Balatonfüredi Atlétikai Club',
            address: '8230 Balatonfüred, Vörösmarty u. 3.',
            taxNumber: '19225067-1-19',
            regNumber: '19-02-0003889',
            phone: '+36 703 230 662',
            email: 'bhebalaton@gmail.com',
            representative: 'Baranyai Máté',
            bankName: 'OTP Bank',
            bankAccountNumber: '11748069-25512412-00000000',
            iban: 'HU16117480692551241200000000'
        };

        const mockEvent = {
            title: 'SCHILLER SZERELMES FÜRED 2026',
        };

        const mockDistance = {
            name: '21km Félmaraton',
            price: 12000
        };

        const mockRegistration = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            user: {
                firstName: 'Gipsz',
                lastName: 'Jakab',
                email: 'test@example.com',
                city: 'Budapest',
                address: 'Teszt utca 10.',
                zipCode: '1011'
            },
            formData: {
                billingName: 'Gipsz Jakab',
                billingZip: '1011',
                billingCity: 'Budapest',
                billingAddress: 'Teszt utca 10.'
            }
        };

        // Generate PDF (type cast for mock data compatibility)
        const pdfBuffer = await generateProformaPDF(
            mockRegistration as any,
            mockEvent as any,
            mockDistance as any,
            mockSeller
        );

        // Return as PDF stream (convert to Buffer for NextResponse)
        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="proforma_preview.pdf"',
            },
        });
    } catch (error) {
        console.error('PDF Preview Error:', error);
        try {
            const logMsg = `[Route Error] ${new Date().toISOString()}: ${error}\n${(error as any).stack}\n----------------\n`;
            // Write asynchronously to avoid blocking but here Sync is safer for debug
            fs.appendFileSync('debug-pdf.log', logMsg);
        } catch (e) {
            // ignore log error
        }
        return NextResponse.json({ error: 'Failed to generate PDF', details: String(error) }, { status: 500 });
    }
}
