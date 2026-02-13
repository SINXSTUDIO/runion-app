import prisma from '@/lib/prisma';

export default async function TestPage() {
    try {
        const users = await prisma.user.findMany();
        return <div id="db-status">Status: Connected. Users: {users.length}</div>;
    } catch (e: any) {
        return <div id="db-status">Status: Error. {e.message}</div>;
    }
}
