import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create restaurant owners
  const owners = await Promise.all([
    prisma.user.create({
      data: {
        email: 'burger@nodo.mx', password: await bcrypt.hash('123456', 10),
        role: 'RESTAURANT', name: 'Burger Joint MX'
      }
    }),
    prisma.user.create({
      data: {
        email: 'sushi@nodo.mx', password: await bcrypt.hash('123456', 10),
        role: 'RESTAURANT', name: 'Sushi Neko'
      }
    }),
    prisma.user.create({
      data: {
        email: 'tacos@nodo.mx', password: await bcrypt.hash('123456', 10),
        role: 'RESTAURANT', name: 'Taquería El Patrón'
      }
    }),
    prisma.user.create({
      data: {
        email: 'pizza@nodo.mx', password: await bcrypt.hash('123456', 10),
        role: 'RESTAURANT', name: 'Pizza Fuego'
      }
    }),
    prisma.user.create({
      data: {
        email: 'healthy@nodo.mx', password: await bcrypt.hash('123456', 10),
        role: 'RESTAURANT', name: 'Green Bowl Co.'
      }
    }),
  ]);

  // Create demo customer
  await prisma.user.create({
    data: {
      email: 'demo@nodo.mx', password: await bcrypt.hash('123456', 10),
      role: 'CUSTOMER', name: 'Diego (Demo)'
    }
  });

  // Create demo courier
  await prisma.user.create({
    data: {
      email: 'courier@nodo.mx', password: await bcrypt.hash('123456', 10),
      role: 'COURIER', name: 'Repartidor Demo'
    }
  });

  // Create restaurants
  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: 'Smash Burger Joint', description: 'Las mejores smash burgers artesanales de la ciudad.',
        category: 'Hamburguesas', rating: 4.8, deliveryTime: '15-25 min', distanceKm: 2.3,
        image: '🍔', ownerId: owners[0].id,
        menuItems: {
          create: [
            { name: 'Smash Burger Clásica', description: 'Doble carne smash, queso cheddar, cebolla caramelizada', price: 89, image: '🍔', category: 'Burgers' },
            { name: 'Smash Burger Doble', description: 'Cuádruple carne, doble queso, tocino crocante, salsa BBQ', price: 129, image: '🍔', category: 'Burgers' },
            { name: 'Chicken Burger', description: 'Pechuga empanizada crujiente, mayo chipotle, lechuga', price: 99, image: '🍗', category: 'Burgers' },
            { name: 'Papas Loaded', description: 'Papas fritas con queso, tocino y jalapeño', price: 69, image: '🍟', category: 'Sides' },
            { name: 'Onion Rings', description: 'Aros de cebolla crujientes con dip ranch', price: 59, image: '🧅', category: 'Sides' },
            { name: 'Malteada Oreo', description: 'Malteada espesa de vainilla con galleta Oreo', price: 65, image: '🥤', category: 'Bebidas' },
            { name: 'Limonada Natural', description: 'Limonada fresca con hierbabuena', price: 35, image: '🍋', category: 'Bebidas' },
          ]
        }
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Sushi Neko', description: 'Sushi fresco y rolls creativos con inspiración japonesa.',
        category: 'Sushi', rating: 4.7, deliveryTime: '25-40 min', distanceKm: 3.8,
        image: '🍣', ownerId: owners[1].id,
        menuItems: {
          create: [
            { name: 'Roll Philadelphia', description: '8 piezas con salmón, queso crema y aguacate', price: 139, image: '🍣', category: 'Rolls' },
            { name: 'Roll Tempura', description: '8 piezas empanizadas con camarón y spicy mayo', price: 159, image: '🍤', category: 'Rolls' },
            { name: 'Nigiri Mixto (6 pzas)', description: 'Salmón, atún y robalo sobre arroz japonés', price: 179, image: '🍣', category: 'Nigiri' },
            { name: 'Edamames', description: 'Vainas de soya al vapor con sal de mar', price: 49, image: '🫛', category: 'Entradas' },
            { name: 'Gyozas (5 pzas)', description: 'Dumplings de cerdo a la plancha', price: 79, image: '🥟', category: 'Entradas' },
            { name: 'Té Verde Matcha', description: 'Matcha latte frío o caliente', price: 55, image: '🍵', category: 'Bebidas' },
          ]
        }
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Taquería El Patrón', description: 'Tacos al pastor, bistec y suadero como los de la calle.',
        category: 'Mexicana', rating: 4.9, deliveryTime: '10-20 min', distanceKm: 1.5,
        image: '🌮', ownerId: owners[2].id,
        menuItems: {
          create: [
            { name: 'Orden de Tacos al Pastor (5)', description: 'Con piña, cilantro, cebolla y salsa verde', price: 75, image: '🌮', category: 'Tacos' },
            { name: 'Orden de Tacos de Bistec (5)', description: 'Bistec a la plancha con guacamole', price: 85, image: '🥩', category: 'Tacos' },
            { name: 'Quesadilla de Chicharrón', description: 'Tortilla de maíz con chicharrón prensado y queso', price: 45, image: '🫓', category: 'Quesadillas' },
            { name: 'Gringa', description: 'Tortilla de harina con pastor y queso fundido', price: 55, image: '🌮', category: 'Especialidades' },
            { name: 'Agua de Horchata (1L)', description: 'Agua fresca de horchata artesanal', price: 40, image: '🥛', category: 'Bebidas' },
          ]
        }
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Pizza Fuego', description: 'Pizzas artesanales al horno de leña con ingredientes premium.',
        category: 'Pizza', rating: 4.6, deliveryTime: '20-35 min', distanceKm: 4.1,
        image: '🍕', ownerId: owners[3].id,
        menuItems: {
          create: [
            { name: 'Margherita', description: 'Salsa pomodoro, mozzarella fresca, albahaca', price: 149, image: '🍕', category: 'Pizzas' },
            { name: 'Pepperoni Clásica', description: 'Pepperoni importado, mozzarella, salsa de tomate', price: 169, image: '🍕', category: 'Pizzas' },
            { name: 'BBQ Chicken', description: 'Pollo BBQ, cebolla morada, cilantro, mozzarella', price: 179, image: '🍕', category: 'Pizzas' },
            { name: 'Breadsticks (6 pzas)', description: 'Palitos de pan con ajo y queso parmesano', price: 69, image: '🥖', category: 'Sides' },
            { name: 'Coca-Cola 600ml', description: 'Refresco Coca-Cola', price: 30, image: '🥤', category: 'Bebidas' },
          ]
        }
      }
    }),
    prisma.restaurant.create({
      data: {
        name: 'Green Bowl Co.', description: 'Bowls saludables, smoothies y wraps para tu bienestar.',
        category: 'Saludable', rating: 4.5, deliveryTime: '15-25 min', distanceKm: 2.8,
        image: '🥗', ownerId: owners[4].id,
        menuItems: {
          create: [
            { name: 'Buddha Bowl', description: 'Quinoa, garbanzos, aguacate, kale, hummus y aderezo tahini', price: 129, image: '🥗', category: 'Bowls' },
            { name: 'Açaí Bowl', description: 'Base de açaí con granola, plátano, fresas y miel', price: 109, image: '🫐', category: 'Bowls' },
            { name: 'Wrap de Pollo', description: 'Tortilla integral con pollo grillado, verduras y aderezo ranch', price: 99, image: '🌯', category: 'Wraps' },
            { name: 'Smoothie Verde', description: 'Espinaca, plátano, mango y leche de almendra', price: 65, image: '🥤', category: 'Smoothies' },
            { name: 'Jugo Detox', description: 'Naranja, zanahoria, jengibre y cúrcuma', price: 55, image: '🧃', category: 'Smoothies' },
          ]
        }
      }
    }),
    prisma.restaurant.create({ data: { name: 'KFC (Simulado)', description: 'Pollo frito receta original', category: 'Hamburguesas', rating: 4.4, deliveryTime: '20-30 min', distanceKm: 5.1, image: '🍗', ownerId: (await prisma.user.create({ data: { email: 'mock_rest_1@nodo.mx', password: '123', role: 'RESTAURANT', name: 'KFC' }})).id, menuItems: { create: [{ name: 'Paquete 8 Piezas', description: '8 piezas de receta original con complementos', price: 299, image: '🍗', category: 'Paquetes' }, { name: 'Ke-Tira', description: 'Tiras de pollo crujiente', price: 89, image: '🍗', category: 'Snacks' }] } } }),
    prisma.restaurant.create({ data: { name: 'Starbucks (Simulado)', description: 'Café y bebidas frías', category: 'Café', rating: 4.8, deliveryTime: '10-15 min', distanceKm: 1.2, image: '☕', ownerId: (await prisma.user.create({ data: { email: 'mock_rest_2@nodo.mx', password: '123', role: 'RESTAURANT', name: 'Starbucks' }})).id, menuItems: { create: [{ name: 'Caramel Macchiato', description: 'Leche manchada con espresso y caramelo', price: 85, image: '☕', category: 'Bebidas Calientes' }, { name: 'Frappuccino Mocha', description: 'Bebida helada mezclada con café y chocolate', price: 95, image: '🥤', category: 'Frappuccinos' }] } } }),
    prisma.restaurant.create({ data: { name: 'Little Caesars (Simulado)', description: 'Pizza Hot-N-Ready', category: 'Pizza', rating: 4.3, deliveryTime: '15-20 min', distanceKm: 3.5, image: '🍕', ownerId: (await prisma.user.create({ data: { email: 'mock_rest_3@nodo.mx', password: '123', role: 'RESTAURANT', name: 'Little Caesars' }})).id, menuItems: { create: [{ name: 'Pizza Pepperoni Clásica', description: 'Lista para llevar', price: 99, image: '🍕', category: 'Pizzas' }, { name: 'Crazy Bread', description: 'Pan con ajo y parmesano', price: 49, image: '🥖', category: 'Complementos' }] } } }),
    prisma.restaurant.create({ data: { name: 'Subway (Simulado)', description: 'Subs frescos y saludables', category: 'Saludable', rating: 4.5, deliveryTime: '10-20 min', distanceKm: 2.1, image: '🥖', ownerId: (await prisma.user.create({ data: { email: 'mock_rest_4@nodo.mx', password: '123', role: 'RESTAURANT', name: 'Subway' }})).id, menuItems: { create: [{ name: 'Sub Italiano de 30cm', description: 'Salami, pepperoni y jamón', price: 135, image: '🥖', category: 'Subs' }, { name: 'Galleta con chispas de chocolate', description: 'Galleta horneada', price: 25, image: '🍪', category: 'Postres' }] } } }),
    prisma.restaurant.create({ data: { name: 'Dairy Queen (Simulado)', description: 'Helados y blizzards', category: 'Postres', rating: 4.7, deliveryTime: '15-25 min', distanceKm: 4.2, image: '🍦', ownerId: (await prisma.user.create({ data: { email: 'mock_rest_5@nodo.mx', password: '123', role: 'RESTAURANT', name: 'Dairy Queen' }})).id, menuItems: { create: [{ name: 'Blizzard Oreo', description: 'Helado cremoso mezclado con Oreo', price: 79, image: '🍦', category: 'Blizzards' }, { name: 'Cono Cubierto de Chocolate', description: 'Cono de vainilla cubierto', price: 35, image: '🍦', category: 'Conos' }] } } }),
    prisma.restaurant.create({ data: { name: 'Tacos El Paisa', description: 'Tacos de guisado y carnitas', category: 'Mexicana', rating: 4.6, deliveryTime: '10-20 min', distanceKm: 1.8, image: '🌮', ownerId: (await prisma.user.create({ data: { email: 'mock_rest_6@nodo.mx', password: '123', role: 'RESTAURANT', name: 'Tacos El Paisa' }})).id, menuItems: { create: [{ name: 'Taco de Carnitas', description: 'Maciza o surtida', price: 25, image: '🌮', category: 'Tacos' }, { name: 'Taco de Suadero', description: 'Suadero confitado', price: 20, image: '🌮', category: 'Tacos' }] } } }),
    prisma.restaurant.create({ data: { name: 'Sushi Itto (Simulado)', description: 'Sushi tradicional', category: 'Sushi', rating: 4.5, deliveryTime: '30-40 min', distanceKm: 6.2, image: '🍣', ownerId: (await prisma.user.create({ data: { email: 'mock_rest_7@nodo.mx', password: '123', role: 'RESTAURANT', name: 'Sushi Itto' }})).id, menuItems: { create: [{ name: 'California Roll', description: 'Surimi, pepino y aguacate', price: 95, image: '🍣', category: 'Rollos Clásicos' }, { name: 'Yakimeshi Mixto', description: 'Arroz frito con pollo, carne y camarón', price: 110, image: '🍚', category: 'Arroces' }] } } }),
  ]);

  console.log(`✅ Created ${owners.length} restaurant owners`);
  console.log(`✅ Created ${restaurants.length} restaurants with menus`);
  console.log('✅ Created demo customer (demo@nodo.mx / 123456)');
  console.log('✅ Created demo courier (courier@nodo.mx / 123456)');
  console.log('🌱 Seeding complete!');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
