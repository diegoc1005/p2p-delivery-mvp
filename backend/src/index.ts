import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { negotiateDeliveryFee, searchRestaurantsAI } from './ai';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'nodo_secret_hackathon_2026';

// --- WEBSOCKETS ---
io.on('connection', (socket) => {
  console.log('[WS] Connected:', socket.id);
  socket.on('join_room', (room: string) => { socket.join(room); });
  socket.on('disconnect', () => {});
});

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role, name }
    });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- RESTAURANTS CATALOG ---
app.get('/api/restaurants', async (_req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isOpen: true },
      orderBy: { rating: 'desc' }
    });
    res.json(restaurants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      include: { menuItems: { where: { isAvailable: true } } }
    });
    if (!restaurant) return res.status(404).json({ error: 'Not found' });
    res.json(restaurant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI NEGOTIATION ---
app.post('/api/orders/negotiate', async (req, res) => {
  try {
    const { distanceKm, weather, traffic } = req.body;
    const feeData = await negotiateDeliveryFee(distanceKm || 3.5, weather || "soleado", traffic || "moderado");
    res.json(feeData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI SEARCH ---
app.post('/api/ai/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });
    const restaurants = await prisma.restaurant.findMany({ include: { menuItems: true } });
    const recommendedId = await searchRestaurantsAI(query, restaurants);
    if (recommendedId === 'NULL') {
      return res.json({ restaurantId: null });
    }
    res.json({ restaurantId: recommendedId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- ORDERS ---
app.post('/api/orders/create', async (req, res) => {
  try {
    const { restaurantId, customerId, items, deliveryFee } = req.body;

    // Find the restaurant to get its ownerId
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    // Calculate food total from items
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: any) => i.menuItemId) } }
    });
    const foodTotal = items.reduce((total: number, item: any) => {
      const menuItem = menuItems.find((m: any) => m.id === item.menuItemId);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);

    const deliverySecretCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simulate Blockchain Consensus (Soroban)
    await new Promise(r => setTimeout(r, 2000));
    const smartContractTxHash = require('crypto').randomBytes(32).toString('hex');

    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        customerId,
        status: 'ESCROW_LOCKED',
        foodTotal,
        deliveryFee: deliveryFee || 18.5,
        deliverySecretCode,
        smartContractTxHash,
        items: {
          create: items.map((i: any) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity
          }))
        }
      },
      include: { items: { include: { menuItem: true } } }
    });

    // Emit to vendor in real time
    io.to(`vendor_${restaurant.ownerId}`).emit('new_order', order);

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { menuItem: true } }, restaurant: true }
    });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.params.userId },
      include: { items: { include: { menuItem: true } }, restaurant: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/vendor/:ownerId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { restaurant: { ownerId: req.params.ownerId } },
      include: { items: { include: { menuItem: true } }, restaurant: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/courier/:courierId', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { courierId: req.params.courierId },
      include: { restaurant: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- COURIER ---
app.get('/api/orders/available/list', async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PREPARING', courierId: null },
      include: { restaurant: true, items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- VENDOR STATUS UPDATE ---
app.post('/api/orders/:id/prepare', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'PREPARING' }
    });
    io.to(`customer_${order.customerId}`).emit('order_update', { ...order, status: 'PREPARING' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/:id/accept', async (req, res) => {
  try {
    const { courierId } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'IN_TRANSIT', courierId },
      include: { restaurant: true }
    });
    io.to(`customer_${order.customerId}`).emit('order_update', { ...order, status: 'IN_TRANSIT' });
    io.to(`vendor_${order.restaurant.ownerId}`).emit('order_update', { ...order, status: 'IN_TRANSIT' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders/:id/deliver', async (req, res) => {
  try {
    const { secretCode } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.deliverySecretCode !== secretCode) {
      return res.status(401).json({ error: 'Código de seguridad incorrecto. Fraude detectado.' });
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'DELIVERED' }
    });
    // Notify customer their order was delivered
    io.to(`customer_${order.customerId}`).emit('order_update', { ...updated, status: 'DELIVERED' });
    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[NODO Protocol] Backend on port ${PORT}`);
});
