"use server";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { logError } from "@/lib/logger";
import { auth } from "@/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function uploadImage(formData: FormData) {
    try {
        // Allow any authenticated user
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Bejelentkezés szükséges." };
        }
        // Removed requireAdmin() to allow profile uploads


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

        // Generate unique filename
        const uniqueId = crypto.randomBytes(8).toString("hex");
        const extension = ".webp"; // We convert everything to webp for optimization
        const filename = `${uniqueId}${extension}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Ensure directory exists
        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        await sharp(buffer)
            .resize(resizeOptions)
            .webp({ quality: preset === "avatar" ? 75 : 80 })
            .toFile(filepath);

        return {
            success: true,
            url: `/uploads/${filename}`,
            filename
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

        if (!url.startsWith("/uploads/")) {
            return { success: false, error: "Érvénytelen fájl útvonal" };
        }

        const filename = path.basename(url);
        const filepath = path.join(UPLOAD_DIR, filename);

        await fs.unlink(filepath);
        return { success: true };
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            await logError(error, 'Image Delete');
            console.error('[deleteImage] Error:', error);
        }
        // We return success true even on error if file doesn't exist, as the goal is achieved
        return { success: true };
    }
}
