const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUsersByRestaurant() {
    const mappings = {
        'KFC (Simulado)': 'kfc@nodo.mx',
        'Starbucks (Simulado)': 'starbucks@nodo.mx',
        'Little Caesars (Simulado)': 'littlecaesars@nodo.mx',
        'Subway (Simulado)': 'subway@nodo.mx',
        'Dairy Queen (Simulado)': 'dq@nodo.mx',
        'Tacos El Paisa': 'paisa@nodo.mx',
        'Sushi Itto (Simulado)': 'sushiitto@nodo.mx'
    };

    // Step 1: Give everyone a temp email to avoid unique constraints
    for (const restName of Object.keys(mappings)) {
        const rest = await prisma.restaurant.findFirst({ where: { name: restName } });
        if (rest) {
            await prisma.user.update({
                where: { id: rest.ownerId },
                data: { email: `temp_${Math.random()}@nodo.mx` }
            });
        }
    }

    // Step 2: Assign the final correct emails
    for (const [restName, email] of Object.entries(mappings)) {
        const rest = await prisma.restaurant.findFirst({ where: { name: restName } });
        if (rest) {
            await prisma.user.update({
                where: { id: rest.ownerId },
                data: { 
                    email: email,
                    name: restName
                }
            });
            console.log(`Updated owner of ${restName} to be ${email}`);
        }
    }
}

fixUsersByRestaurant()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
