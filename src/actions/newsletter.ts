"use server";

import { logError } from "@/lib/logger";

export async function subscribeNewsletter(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;

    if (!email) {
        return { success: false, message: "Email is required" };
    }

    try {
        // Technical parameters extracted from the external form
        const targetUrl = "https://runion.hirlevel.etsolution.hu/subscription/mxvaJikrr/subscribe";

        // CSRF and other hidden fields are often required by these legacy systems
        // However, many simpler mail providers allow direct POSTing of fields
        // We'll try to emulate the form submission

        const body = new URLSearchParams();
        body.append("email", email);
        body.append("first-name", firstName || "");
        body.append("last-name", lastName || "");
        body.append("sub", Date.now().toString()); // Extracted from script at line 164 of HTML
        body.append("tz", "Europe/Budapest"); // Defaulting to Budapest or we could try to detect from client

        const response = await fetch(targetUrl, {
            method: "POST",
            body: body,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://runion.hirlevel.etsolution.hu/subscription/mxvaJikrr",
            },
        });

        // The external provider usually returns a 302 redirect or a 200 with a success message
        // Since we are doing it via fetch, we check if it was generally successful
        if (response.ok) {
            return { success: true, message: "Success" };
        } else {
            const errorText = await response.text();
            logError(new Error(`Newsletter subscription failed: ${errorText.substring(0, 500)}`), "NewsletterAction");
            return { success: false, message: "Provider error" };
        }

    } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), "NewsletterAction");
        return { success: false, message: "Network error" };
    }
}
