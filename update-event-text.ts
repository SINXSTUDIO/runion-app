
import { prisma } from './src/lib/prisma';

async function updateEventText() {
    // ID for X. SCHILLER SZERELMES FÜRED
    const eventId = '15ca7278-ce1a-4f24-a292-a2e2a12ff33b';

    // Sample text from Pezowood or generic
    const text = `Kedves Futó!

Köszönjük nevezésedet a X. SCHILLER SZERELMES FÜRED versenyre!

FONTOS INFORMÁCIÓK:
A versenyközpont a Balatonfüredi Vitorlás téren található.
Rajtcsomag átvétel: 8:00 - 9:30 között.

Kérjük, hogy a parkoláshoz használd a kijelölt parkolókat.

Várunk szeretettel!
Szervezők`;

    console.log(`Updating event ${eventId} with text...`);

    const updated = await prisma.event.update({
        where: { id: eventId },
        data: {
            confirmationEmailText: text
        }
    });

    console.log('Update successful!');
    console.log('New Text Length:', updated.confirmationEmailText?.length);
    console.log('Preview:', updated.confirmationEmailText?.substring(0, 50));
}

updateEventText()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
