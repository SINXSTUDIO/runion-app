-- ================================================
-- RUNION ADMIN FIX SCRIPT
-- ================================================
-- Használat: Másold ki az SQL parancsot és futtasd Prisma Studio-ban

-- 1. ELLENŐRZÉS: Aktuális role
SELECT email, role, "firstName", "lastName" 
FROM "User" 
WHERE email = 'szkami75@gmail.com';

-- 2. ROLE FRISSÍTÉS ADMIN-RA
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'szkami75@gmail.com';

-- 3. ELLENŐRZÉS: Módosítás után
SELECT email, role, "firstName", "lastName" 
FROM "User" 
WHERE email = 'szkami75@gmail.com';

-- ================================================
-- HASZNÁLATI ÚTMUTATÓ
-- ================================================
-- Prisma Studio: http://localhost:5556
-- 1. Bal oldali menü: "User" tábla
-- 2. Keresd meg: szkami75@gmail.com
-- 3. "role" oszlop: USER -> ADMIN (dropdown)  
-- 4. Mentés (Save)
-- 
-- VAGY SQL Console használata (ha van):
-- Másold be a fenti UPDATE parancsot
-- ================================================
