export default function InvoiceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="hu">
            <body>
                {children}
            </body>
        </html>
    );
}
