import { checkAndCreateAutoBackup } from '@/actions/auto-backup';

export default async function SecretBaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Non-blocking background check for auto backup
    checkAndCreateAutoBackup().catch(err => {
        console.warn('[SecretBaseLayout] Auto-backup check warning:', err);
    });

    return <>{children}</>;
}
