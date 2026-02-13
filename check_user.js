const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const email = 'klokkdeporofogbda@gmail.com'; // A felhasználó e-mailje
    const user = await prisma.user.findUnique({
        where: { email }
    });
    console.log(JSON.stringify(user, null, 2));
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
