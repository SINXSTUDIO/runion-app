import { checkAndCreateAutoBackup } from '@/actions/auto-backup';

export default async function SecretBaseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Trigger Auto Backup Check (Fire and Forget or Await? Await is safer to ensure it happens)
    // Doing it here covers all admin pages.
    await checkAndCreateAutoBackup();

    return <>{children}</>;
}
