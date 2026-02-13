import { Metadata } from 'next';
import { AuditLogsClient } from './AuditLogsClient';

export const metadata: Metadata = {
    title: 'Audit Napló',
    description: 'Adatbázis műveletek nyomon követése',
};

export default function AuditLogsPage() {
    return <AuditLogsClient />;
}
