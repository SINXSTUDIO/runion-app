"use server";

import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { logError } from "@/lib/logger";
import { auth } from "@/auth";

export async function uploadImage(formData: FormData) {
    try {
        // Allow any authenticated user
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Bejelentkezés szükséges." };
        }

        const file = formData.get("file") as File;

        if (!file) {
            return { success: false, error: "Nincs fájl kiválasztva" };
        }

        // Validation: Max size 5MB
        if (file.size > 5 * 1024 * 1024) {
            return { success: false, error: "A fájl mérete nem haladhatja meg az 5MB-ot." };
        }

        // Validation: Allowed MIME types
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: "Csak képfájlok (JPG, PNG, WEBP, GIF) tölthetők fel." };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Optimize image with sharp based on preset
        const preset = formData.get("preset") as string || "standard";

        let resizeOptions: sharp.ResizeOptions = {
            width: 1920,
            height: 1920,
            fit: "inside",
            withoutEnlargement: true,
        };

        if (preset === "avatar") {
            resizeOptions = {
                width: 500,
                height: 500,
                fit: "cover", // Crop to square for avatars
                position: "center",
            };
        }

        // Check if token exists
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error("BLOB_READ_WRITE_TOKEN is missing!");
            return {
                success: false,
                error: "Konfigurációs hiba: A felhő tárhely nincs beállítva (BLOB_READ_WRITE_TOKEN hiányzik)."
            };
        }

        // Process image to WebP
        const optimizedBuffer = await sharp(buffer)
            .resize(resizeOptions)
            .webp({ quality: preset === "avatar" ? 75 : 80 })
            .toBuffer();

        // Generate filename
        const filename = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}.webp`;

        // Upload to Vercel Blob
        const blob = await put(filename, optimizedBuffer, {
            access: 'public',
            contentType: 'image/webp'
        });

        return {
            success: true,
            url: blob.url,
            filename: blob.pathname
        };
    } catch (error: any) {
        console.error('[uploadImage] ERROR DETAILS:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        await logError(error, 'Image Upload');
        return { success: false, error: `Hiba: ${error.message || "Ismeretlen hiba"}` };
    }
}

export async function deleteImage(url: string) {
    try {
        // Allow authenticated users
        const session = await auth();
        if (!session?.user) return { success: false, error: "Unauthorized" };

        if (!url) return { success: false, error: "Érvénytelen URL" };

        // If it's a Vercel Blob URL (contains public.blob.vercel-storage.com)
        if (url.includes(".public.blob.vercel-storage.com")) {
            await del(url);
            return { success: true };
        }

        // Legacy: Local file deletion (won't work on Vercel but kept for backward compat if migrating)
        // We just ignore local deletion errors on Vercel as files are ephemeral anyway
        return { success: true };

    } catch (error: any) {
        await logError(error, 'Image Delete');
        console.error('[deleteImage] Error:', error);
        // We return success true even on error
        return { success: true };
    }
}
