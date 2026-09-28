const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
    const menus = {
        'KFC (Simulado)': [
            { name: 'Paquete 8 Piezas', description: '8 piezas de receta original con complementos', price: 299, image: '🍗', category: 'Paquetes' },
            { name: 'Ke-Tira', description: 'Tiras de pollo crujiente', price: 89, image: '🍗', category: 'Snacks' }
        ],
        'Starbucks (Simulado)': [
            { name: 'Caramel Macchiato', description: 'Leche manchada con espresso y caramelo', price: 85, image: '☕', category: 'Bebidas Calientes' },
            { name: 'Frappuccino Mocha', description: 'Bebida helada mezclada con café y chocolate', price: 95, image: '🥤', category: 'Frappuccinos' }
        ],
        'Little Caesars (Simulado)': [
            { name: 'Pizza Pepperoni Clásica', description: 'Lista para llevar', price: 99, image: '🍕', category: 'Pizzas' },
            { name: 'Crazy Bread', description: 'Pan con ajo y parmesano', price: 49, image: '🥖', category: 'Complementos' }
        ],
        'Subway (Simulado)': [
            { name: 'Sub Italiano de 30cm', description: 'Salami, pepperoni y jamón', price: 135, image: '🥖', category: 'Subs' },
            { name: 'Galleta con chispas de chocolate', description: 'Galleta horneada', price: 25, image: '🍪', category: 'Postres' }
        ],
        'Dairy Queen (Simulado)': [
            { name: 'Blizzard Oreo', description: 'Helado cremoso mezclado con Oreo', price: 79, image: '🍦', category: 'Blizzards' },
            { name: 'Cono Cubierto de Chocolate', description: 'Cono de vainilla cubierto', price: 35, image: '🍦', category: 'Conos' }
        ],
        'Tacos El Paisa': [
            { name: 'Taco de Carnitas', description: 'Maciza o surtida', price: 25, image: '🌮', category: 'Tacos' },
            { name: 'Taco de Suadero', description: 'Suadero confitado', price: 20, image: '🌮', category: 'Tacos' }
        ],
        'Sushi Itto (Simulado)': [
            { name: 'California Roll', description: 'Surimi, pepino y aguacate', price: 95, image: '🍣', category: 'Rollos Clásicos' },
            { name: 'Yakimeshi Mixto', description: 'Arroz frito con pollo, carne y camarón', price: 110, image: '🍚', category: 'Arroces' }
        ]
    };

    for (const [restName, items] of Object.entries(menus)) {
        const restaurant = await prisma.restaurant.findFirst({ where: { name: restName } });
        if (restaurant) {
            // check if items exist
            const existing = await prisma.menuItem.count({ where: { restaurantId: restaurant.id } });
            if (existing === 0) {
                for (const item of items) {
                    await prisma.menuItem.create({
                        data: {
                            ...item,
                            restaurantId: restaurant.id
                        }
                    });
                }
                console.log(`Added items to ${restName}`);
            } else {
                console.log(`Items already exist for ${restName}`);
            }
        } else {
            console.log(`Restaurant not found: ${restName}`);
        }
    }
}

update()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
