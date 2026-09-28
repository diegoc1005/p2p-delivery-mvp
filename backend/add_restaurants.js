const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function add() {
  const restaurants = [
    { name: 'KFC (Simulado)', description: 'Pollo frito receta original', category: 'Hamburguesas', rating: 4.4, deliveryTime: '20-30 min', distanceKm: 5.1, image: '🍗' },
    { name: 'Starbucks (Simulado)', description: 'Café y bebidas frías', category: 'Café', rating: 4.8, deliveryTime: '10-15 min', distanceKm: 1.2, image: '☕' },
    { name: 'Little Caesars (Simulado)', description: 'Pizza Hot-N-Ready', category: 'Pizza', rating: 4.3, deliveryTime: '15-20 min', distanceKm: 3.5, image: '🍕' },
    { name: 'Subway (Simulado)', description: 'Subs frescos y saludables', category: 'Saludable', rating: 4.5, deliveryTime: '10-20 min', distanceKm: 2.1, image: '🥖' },
    { name: 'Dairy Queen (Simulado)', description: 'Helados y blizzards', category: 'Postres', rating: 4.7, deliveryTime: '15-25 min', distanceKm: 4.2, image: '🍦' },
    { name: 'Tacos El Paisa', description: 'Tacos de guisado y carnitas', category: 'Mexicana', rating: 4.6, deliveryTime: '10-20 min', distanceKm: 1.8, image: '🌮' },
    { name: 'Sushi Itto (Simulado)', description: 'Sushi tradicional', category: 'Sushi', rating: 4.5, deliveryTime: '30-40 min', distanceKm: 6.2, image: '🍣' },
  ];

  for(let i=0; i<restaurants.length; i++) {
    const r = restaurants[i];
    const user = await prisma.user.create({
      data: { email: `mock_rest_${i}@nodo.mx`, password: '123', role: 'RESTAURANT', name: r.name }
    });
    await prisma.restaurant.create({
      data: { ...r, ownerId: user.id }
    });
  }
  console.log("Added 7 more restaurants");
}
add();
