const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function fix() {
    const passwordHash = await bcrypt.hash('123456', 10);
    
    const updates = [
        { name: 'KFC', email: 'kfc@nodo.mx' },
        { name: 'Starbucks', email: 'starbucks@nodo.mx' },
        { name: 'Little Caesars', email: 'littlecaesars@nodo.mx' },
        { name: 'Subway', email: 'subway@nodo.mx' },
        { name: 'Dairy Queen', email: 'dq@nodo.mx' },
        { name: 'Tacos El Paisa', email: 'paisa@nodo.mx' },
        { name: 'Sushi Itto', email: 'sushiitto@nodo.mx' }
    ];

    for (let i = 0; i < updates.length; i++) {
        const oldEmail = `mock_rest_${i + 1}@nodo.mx`;
        const user = await prisma.user.findUnique({ where: { email: oldEmail } });
        if (user) {
            await prisma.user.update({
                where: { email: oldEmail },
                data: {
                    email: updates[i].email,
                    password: passwordHash
                }
            });
            console.log(`Updated ${oldEmail} -> ${updates[i].email} with hash password`);
        } else {
            console.log(`Could not find ${oldEmail}`);
        }
    }
}

fix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
