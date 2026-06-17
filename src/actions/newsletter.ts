"use server";

import prisma from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function subscribeNewsletter(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;

    if (!email) {
        return { success: false, message: "Email is required" };
    }

    try {
        // Save to local database
        await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: {
                firstName: firstName || null,
                lastName: lastName || null,
                active: true,
            },
            create: {
                email,
                firstName: firstName || null,
                lastName: lastName || null,
                active: true,
            },
        });

        // NOTE: External subscription is temporarily disabled until local sending system is ready.
        // If you want to reactivate the legacy sender, uncomment the block below:
        /*
        const targetUrl = "https://runion.hirlevel.etsolution.hu/subscription/mxvaJikrr/subscribe";
        const body = new URLSearchParams();
        body.append("email", email);
        body.append("first-name", firstName || "");
        body.append("last-name", lastName || "");
        body.append("sub", Date.now().toString());
        body.append("tz", "Europe/Budapest");

        const response = await fetch(targetUrl, {
            method: "POST",
            body: body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://runion.hirlevel.etsolution.hu/subscription/mxvaJikrr",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            logError(new Error(`External newsletter subscription failed: ${errorText.substring(0, 500)}`), "NewsletterAction");
        }
        */

        return { success: true, message: "Success" };
    } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), "NewsletterAction");
        return { success: false, message: "Network error" };
    }
}
