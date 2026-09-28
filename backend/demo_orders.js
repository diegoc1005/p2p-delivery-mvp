const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDemoOrders() {
    const restaurants = await prisma.restaurant.findMany({
        where: {
            name: {
                in: ['KFC (Simulado)', 'Starbucks (Simulado)', 'Little Caesars (Simulado)', 'Subway (Simulado)', 'Dairy Queen (Simulado)', 'Sushi Itto (Simulado)']
            }
        },
        include: { menuItems: true }
    });

    const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });

    if (!customer) {
        console.log("No customer found");
        return;
    }

    for (const rest of restaurants) {
        if (rest.menuItems.length === 0) continue;

        // Create 2 fake delivered orders and 1 pending order
        const totalSales = Math.floor(Math.random() * 500) + 200;

        for (let i = 0; i < 3; i++) {
            const item = rest.menuItems[Math.floor(Math.random() * rest.menuItems.length)];
            const status = i === 0 ? 'ESCROW_LOCKED' : 'DELIVERED'; // 1 pending, 2 delivered

            await prisma.order.create({
                data: {
                    customerId: customer.id,
                    restaurantId: rest.id,
                    foodTotal: item.price * 2,
                    deliveryFee: 25,
                    status: status,
                    deliverySecretCode: Math.floor(100000 + Math.random() * 900000).toString(),
                    items: {
                        create: [
                            {
                                menuItemId: item.id,
                                quantity: 2
                            }
                        ]
                    }
                }
            });
        }
        console.log(`Created 3 demo orders for ${rest.name}`);
    }
}

createDemoOrders()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
