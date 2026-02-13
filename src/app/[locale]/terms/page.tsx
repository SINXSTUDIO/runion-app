import { Card } from '@/components/ui/Card';

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-black font-heading mb-8 text-white uppercase italic tracking-tighter">
                Általános Szerződési Feltételek <span className="text-accent">(2026)</span>
            </h1>
            <Card className="p-8 md:p-12 bg-zinc-900 border-zinc-800 text-gray-300 space-y-6 leading-relaxed">
                <p className="text-sm italic border-l-2 border-accent pl-4">
                    Jelen dokumentum nem minősül írásbeli szerződésnek, magyar nyelven íródik, magatartási kódexre nem utal. A webshop működésével, megrendelési és szállítási folyamatával kapcsolatosan felmerülő kérdések esetén a megadott elérhetőségeinken rendelkezésére állunk.
                </p>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">1. SZOLGÁLTATÓ ADATAI</h2>
                    <ul className="space-y-1">
                        <li><span className="text-gray-500">Név:</span> Balatonfüredi Atlétikai Club Tömegsport és Utánpótlás-nevelő Egyesület</li>
                        <li><span className="text-gray-500">Székhely:</span> 8230 Balatonfüred, Vörösmarty u. 3.</li>
                        <li><span className="text-gray-500">Nyilvántartási szám:</span> 19-02-0003889</li>
                        <li><span className="text-gray-500">Adószám:</span> 19225067-1-19</li>
                        <li><span className="text-gray-500">Képviselő:</span> Baranyai Máté</li>
                        <li><span className="text-gray-500">E-mail:</span> info@runion.eu</li>
                        <li><span className="text-gray-500">Telefon:</span> +36 703 230 662</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">2. TÁRHELY-SZOLGÁLTATÓ ADATAI</h2>
                    <ul className="space-y-1">
                        <li><span className="text-gray-500">Név:</span> MediaCenter Hungary Kft.</li>
                        <li><span className="text-gray-500">Székhely:</span> 6000 Kecskemét, Sosztakovics u. 3. II/6.</li>
                        <li><span className="text-gray-500">E-mail:</span> mediacenter@mediacenter.hu</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">3. ALAPVETŐ RENDELKEZÉSEK</h2>
                    <p>
                        3.1. A jelen Szabályzatban nem szabályozott kérdésekre a magyar jog az irányadó, különös tekintettel a Polgári Törvénykönyvről szóló 2013. évi V. törvény („Ptk.”), az elektronikus kereskedelmi szolgáltatásokról szóló 2001. évi CVIII. törvény, valamint a fogyasztó és a vállalkozás közötti szerződések részletes szabályairól szóló 45/2014. (II. 26.) Korm. rendeletre.
                    </p>
                    <p>
                        3.2. Jelen Szabályzat visszavonásig hatályos. A Szolgáltató jogosult egyoldalúan módosítani a Szabályzatot, a módosítást a hatályba lépés előtt 14 nappal a weboldalon közzéteszi.
                    </p>
                    <p>
                        3.3. A weboldal tartalma szerzői jogi védelem alatt áll, annak másolása, üzleti célú felhasználása tilos.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">4. FUTÓVERSENYEKRE VONATKOZÓ SPECIÁLIS SZABÁLYOK</h2>
                    <p>
                        4.1. Nevezési díj visszatérítése: A nevezési díj a befizetést követő 14 napig igényelhető vissza indoklás nélkül. Ezt követően a nevezési díj visszafizetésére nincs mód.
                    </p>
                    <p>
                        4.2. Átruházás: A nevezés a versenyt megelőző 10. napig írásban (e-mailben) átruházható más személyre.
                    </p>
                    <p>
                        4.3. Távmódosítás: Versenytáv változtatása a versenyt megelőző 5. napig lehetséges e-mailben.
                    </p>
                    <p>
                        4.4. Kizárás: A szervező fenntartja a jogot a regisztráció elutasítására korábbi sportszerűtlen magatartás vagy a szervezők jóhírnevének bizonyítható megsértése esetén. Ez esetben a nevezési díj visszautalásra kerül.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">5. TERMÉKEK, ÁRAK ÉS RENDELÉS</h2>
                    <p>
                        5.1. A megjelenített árak forintban értendők. A Szolgáltató alanyi adómentes, így az árak ÁFA-t nem tartalmaznak (bruttó árak). A szállítási költség a pénztár folyamat során adódik a végösszeghez.
                    </p>
                    <p>
                        5.2. Hibás ár: Nyilvánvalóan téves ár (pl. 0 Ft vagy 1 Ft) esetén a Szolgáltató nem köteles a terméket teljesíteni, felajánlja a helyes áron való szállítást, amelynek ismeretében a Felhasználó elállhat.
                    </p>
                    <p>
                        5.3. A Felhasználó a "Megrendelem" gombbal tudomásul veszi, hogy fizetési kötelezettsége keletkezik.
                    </p>
                    <p>
                        5.4. A Szolgáltató 48 órán belül köteles visszaigazolni a rendelést. Ennek elmaradása esetén a Felhasználó mentesül az ajánlati kötöttség alól.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">6. SZÁLLÍTÁS ÉS FIZETÉS</h2>
                    <p>
                        6.1. Fizetési módok: Utánvét (ha elérhető), Banki átutalás (5 napos határidővel).
                    </p>
                    <p>
                        6.2. Szállítási díjak:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>30 000 Ft felett: Ingyenes.</li>
                        <li>FoxPost automata: 890 Ft.</li>
                        <li>GLS csomagpont: 1190 Ft.</li>
                        <li>GLS házhozszállítás: 1290 Ft.</li>
                    </ul>
                    <p>
                        6.3. Teljesítési határidő: Általánosan a szerződés létrejöttétől számított 5 munkanap, de legfeljebb 30 nap.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">7. ELÁLLÁSI JOG (Fogyasztóknak)</h2>
                    <p>
                        7.1. A fogyasztót a 45/2014. (II. 26.) Korm. rendelet alapján 14 napos indokolás nélküli elállási jog illeti meg a termék átvételétől számítva.
                    </p>
                    <p>
                        7.2. Az elállási jog gyakorlása esetén a termék visszaküldésének költsége a Felhasználót terheli.
                    </p>
                    <p>
                        7.3. Kivétel az elállás alól: Nem gyakorolható az elállási jog olyan zárt csomagolású termék esetén, amely egészségvédelmi vagy higiéniai okokból a felbontás után nem küldhető vissza (pl. fehérnemű, használt kulacs), illetve egyedileg gyártott, a fogyasztó kérésére személyre szabott termékeknél.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">8. SZAVATOSSÁG ÉS JÓTÁLLÁS</h2>
                    <p>
                        8.1. Kellékszavatosság: Hibás teljesítés esetén a Felhasználó kérhet kijavítást, kicserélést, vagy árleszállítást/elállást (ha a javítás/csere nem lehetséges). A teljesítéstől számított 1 éven belül a hiba felismerésekor a Szolgáltatónak kell bizonyítania, hogy a hiba oka a vásárlás után keletkezett.
                    </p>
                    <p>
                        8.2. Termékszavatosság: Ingó dolog hibája esetén a gyártótól közvetlenül kérhető a hiba kijavítása vagy a termék cseréje a forgalomba hozataltól számított 2 éven belül.
                    </p>
                    <p>
                        8.3. Kötelező Jótállás (Tartós fogyasztási cikkekre): Amennyiben a termék tartós fogyasztási cikknek minősül, az eladási ártól függő sávos jótállás érvényes:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>10 000 – 100 000 Ft: 1 év jótállás.</li>
                        <li>100 001 – 250 000 Ft: 2 év jótállás.</li>
                        <li>250 000 Ft felett: 3 év jótállás.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">9. PANASZKEZELÉS ÉS JOGORVOSLAT</h2>
                    <p>
                        9.1. A panaszokat a Szolgáltató 30 napon belül írásban megválaszolja.
                    </p>
                    <p>
                        9.2. Békéltető Testület: A fogyasztó lakóhelye szerint illetékes megyei (regionális) Békéltető Testülethez fordulhat.
                    </p>
                    <p>
                        Illetékes testület: Veszprém Megyei Békéltető Testület (Cím: 8200 Veszprém, Radnóti tér 1. Fsz. 115-116. | E-mail: info@bekeltetesveszprem.hu).
                    </p>
                    <p>
                        9.3. További jogérvényesítés: Online vitarendezési platform: <a href="http://ec.europa.eu/odr" className="text-accent hover:underline">http://ec.europa.eu/odr</a>
                    </p>
                </section>

                <div className="pt-8 border-t border-zinc-800 text-sm text-gray-500">
                    Kelt: Balatonfüred, 2026. január 26.
                </div>
            </Card>
        </div>
    );
}
