import { Card } from '@/components/ui/Card';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-black font-heading mb-8 text-white uppercase italic tracking-tighter">
                Adatkezelési <span className="text-accent">Tájékoztató</span>
            </h1>
            <Card className="p-8 md:p-12 bg-zinc-900 border-zinc-800 text-gray-300 space-y-8 leading-relaxed">
                <p className="text-sm font-mono text-accent/70 uppercase tracking-widest">
                    (GDPR Megfelelőségi Nyilatkozat - 2026)
                </p>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-accent/20 pb-2">1. AZ ADATKEZELŐ ADATAI</h2>
                    <ul className="space-y-1">
                        <li><span className="text-gray-500">Név:</span> Balatonfüredi Atlétikai Club Tömegsport és Utánpótlás-nevelő Egyesület</li>
                        <li><span className="text-gray-500">Székhely:</span> 8230 Balatonfüred, Vörösmarty u. 3.</li>
                        <li><span className="text-gray-500">Adószám:</span> 19225067-1-19</li>
                        <li><span className="text-gray-500">Nyilvántartási szám:</span> 19-02-0003889</li>
                        <li><span className="text-gray-500">E-mail:</span> info@runion.eu</li>
                        <li><span className="text-gray-500">Weboldal:</span> <a href="https://runion.eu" className="text-accent hover:underline">https://runion.eu</a></li>
                    </ul>
                </section>

                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-accent/20 pb-2">2. AZ ADATKEZELÉS CÉLJA, JOGALAPJA ÉS IDŐTARTAMA</h2>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white/90 underline decoration-accent/30">2.1. Webshopos vásárlás és regisztráció</h3>
                        <p><span className="font-bold text-gray-400">Cél:</span> A megrendelések teljesítése, számlázás, szállítás, kapcsolattartás.</p>
                        <p><span className="font-bold text-gray-400">Jogalap:</span> Szerződés teljesítése [GDPR 6. cikk (1) bek. b) pont]. A számlázás tekintetében jogi kötelezettség teljesítése.</p>
                        <p><span className="font-bold text-gray-400">Kezelt adatok:</span> Név, számlázási cím, szállítási cím, e-mail cím, telefonszám.</p>
                        <p><span className="font-bold text-gray-400">Időtartam:</span> A számviteli bizonylatokat a Számviteli törvény alapján 8 évig kötelesek vagyunk megőrizni.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white/90 underline decoration-accent/30">2.2. Versenynevezés</h3>
                        <p><span className="font-bold text-gray-400">Cél:</span> Futóversenyek szervezése, rajtlista összeállítása, eredményhirdetés, időmérés.</p>
                        <p><span className="font-bold text-gray-400">Jogalap:</span> Szerződés teljesítése és a résztvevő hozzájárulása.</p>
                        <p><span className="font-bold text-gray-400">Kezelt adatok:</span> Név, születési év, nem, egyesület, e-mail cím, választott táv.</p>
                        <p><span className="font-bold text-gray-400">Időtartam:</span> A verseny lezárultát követő 2 év, kivéve az eredménylistát, amely archív céllal megmaradhat.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white/90 underline decoration-accent/30">2.3. Hírlevél (Marketing)</h3>
                        <p><span className="font-bold text-gray-400">Cél:</span> Tájékoztatás jövőbeli versenyekről és akciókról.</p>
                        <p><span className="font-bold text-gray-400">Jogalap:</span> A Felhasználó kifejezett hozzájárulása [GDPR 6. cikk (1) bek. a) pont].</p>
                        <p><span className="font-bold text-gray-400">Időtartam:</span> A hozzájárulás visszavonásáig (leiratkozás).</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-accent/20 pb-2">3. ADATFELDOLGOZÓK</h2>
                    <p className="mb-4 text-sm">Adatait harmadik félnek nem adjuk el, kizárólag a szolgáltatás teljesítéséhez elengedhetetlen partnereknek továbbítjuk:</p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex gap-2"><span className="text-accent">•</span> <span><span className="text-white font-medium">Tárhely-szolgáltató:</span> MediaCenter Hungary Kft. (6000 Kecskemét, Sosztakovics u. 3. II/6).</span></li>
                        <li className="flex gap-2"><span className="text-accent">•</span> <span><span className="text-white font-medium">Szállító partnerek:</span> GLS General Logistics Systems Hungary Csomag-Logisztikai Kft., FOXPOST Zrt.</span></li>

                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-accent/20 pb-2">4. COOKIE-K (SÜTIK) KEZELÉSE</h2>
                    <p>
                        A weboldal látogatottsági statisztikákhoz és a kosár funkció működéséhez sütiket használ. Ön a böngészője beállításaiban bármikor letilthatja ezeket.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-accent/20 pb-2">5. ADATBIZTONSÁG</h2>
                    <p>
                        Az Adatkezelő megtesz minden tőle elvárható technikai és szervezési intézkedést, hogy az adatok ne kerüljenek illetéktelen kezekbe (pl. SSL titkosítás a weboldalon, jelszóval védett rendszerek).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-accent/20 pb-2">6. AZ ÖN JOGAI</h2>
                    <p className="mb-4">Ön kérelmezheti az Adatkezelőtől:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Tájékoztatást személyes adatai kezeléséről (Hozzáférés).</li>
                        <li>Adatainak helyesbítését vagy törlését ("elfeledtetéshez való jog").</li>
                        <li>Az adatkezelés korlátozását.</li>
                        <li>Tiltakozhat az adatai kezelése ellen.</li>
                    </ul>
                    <p className="mt-4">
                        Kérelmét az <a href="mailto:info@runion.eu" className="text-accent hover:underline italic">info@runion.eu</a> címre küldheti.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-accent/20 pb-2">7. JOGORVOSLATI LEHETŐSÉG</h2>
                    <p className="mb-4">Amennyiben úgy érzi, megsértettük adatvédelmi jogait, panasszal élhet:</p>
                    <p className="mb-2">
                        <span className="text-white font-medium">NAIH:</span> Nemzeti Adatvédelmi és Információszabadság Hatóság (1055 Budapest, Falk Miksa utca 9-11., <a href="https://www.naih.hu" className="text-accent hover:underline">www.naih.hu</a>).
                    </p>
                    <p>Valamint pert indíthat a lakóhelye szerint illetékes törvényszéken.</p>
                </section>

                <div className="pt-8 border-t border-zinc-800 text-sm text-gray-500">
                    Kelt: Balatonfüred, 2026. január 26-tól
                </div>
            </Card>
        </div>
    );
}
