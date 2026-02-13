
export const MALE_NAMES = new Set([
    'László', 'István', 'József', 'János', 'Zoltán', 'Sándor', 'Gábor', 'Ferenc', 'Attila', 'Péter',
    'Tamás', 'Tibor', 'Zsolt', 'Csaba', 'András', 'György', 'Lajos', 'Imre', 'Balázs', 'Mihály',
    'Sándor', 'József', 'Béla', 'Márton', 'Gergely', 'Ádám', 'Dávid', 'Róbert', 'Norbert', 'Bence',
    'Máté', 'Krisztián', 'Roland', 'Richárd', 'Attila', 'Szabolcs', 'Viktor', 'Miklós', 'Gyula',
    'Károly', 'Levente', 'Dániel', 'Pál', 'Ákos', 'Zsombor', 'Botond', 'Nimród', 'Kornél', 'Olivér',
    'Marcell', 'Milán', 'Benedek', 'Dominik', 'Zalán', 'Noel', 'Áron', 'Martin', 'Erik', 'Kristóf',
    'Alex', 'Patrik', 'Bálint', 'Csaba', 'Antal', 'Endre', 'Jenő', 'Dezső', 'Ottó', 'Géza', 'Ernő'
]);

export const FEMALE_NAMES = new Set([
    'Mária', 'Erzsébet', 'Katalin', 'Éva', 'Ilona', 'Anna', 'Zsuzsanna', 'Margit', 'Julianna', 'Ágnes',
    'Andrea', 'Erika', 'Krisztina', 'Mónika', 'Gabriella', 'Szilvia', 'Judit', 'Eszter', 'Viktória', 'Edit',
    'Ildikó', 'Anikó', 'Tünde', 'Mariann', 'Melinda', 'Bernadett', 'Enikő', 'Anita', 'Renáta', 'Tímea',
    'Rita', 'Gyöngyi', 'Hajnalka', 'Barbara', 'Adrienn', 'Kinga', 'Nikolett', 'Boglárka', 'Brigitta', 'Dóra',
    'Lilla', 'Réka', 'Vivien', 'Fanni', 'Zsófia', 'Petra', 'Alexandra', 'Kitti', 'Laura', 'Luca', 'Hanna',
    'Jázmin', 'Zoé', 'Léna', 'Emma', 'Sára', 'Gréta', 'Dorina', 'Bianka', 'Csilla', 'Beatrix', 'Orsolya',
    'Zita', 'Klára', 'Magdolna', 'Rozália', 'Piroska', 'Gizella', 'Irén', 'Jolán', 'Boriska', 'Aranka', 'Etelka',
    'Paulina'
]);

export function detectGenderByName(name: string): 'MALE' | 'FEMALE' | null {
    if (!name) return null;
    const cleanName = name.trim();
    // Case insensitive check could be better, but names are usually proper cased.
    // We'll normalize to Title Case mostly or check flexible.

    // Try exact match first
    if (MALE_NAMES.has(cleanName)) return 'MALE';
    if (FEMALE_NAMES.has(cleanName)) return 'FEMALE';

    // Try case-insensitive normalized
    const lower = cleanName.toLowerCase();
    for (const n of MALE_NAMES) if (n.toLowerCase() === lower) return 'MALE';
    for (const n of FEMALE_NAMES) if (n.toLowerCase() === lower) return 'FEMALE';

    return null;
}
