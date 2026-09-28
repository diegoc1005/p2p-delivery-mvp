<p align="center">
  <img src="public/logo.jpg" width="80" alt="NODO Logo" style="border-radius: 16px" />
</p>

<h1 align="center">NODO Protocol</h1>
<p align="center">
  <strong>Delivery Descentralizado · Cero Comisiones · Impulsado por IA</strong>
</p>
<p align="center">
  <a href="#arquitectura">Arquitectura</a> · <a href="#tech-stack">Stack</a> · <a href="#cómo-correrlo">Cómo Correrlo</a> · <a href="#flujo-demo">Demo</a>
</p>

---

## ¿Qué es NODO?

NODO es un **protocolo P2P de logística** que elimina a los intermediarios extractivos como Rappi o UberEats. En lugar de cobrar un 30% de comisión a los restaurantes, NODO usa:

- 🤖 **Agentes de IA (Gemini)** para calcular tarifas de envío justas e imparciales basadas en tráfico, clima y distancia.
- ⛓️ **Smart Contracts (Escrow)** para bloquear los fondos del cliente y liberarlos automáticamente al restaurante y repartidor solo al confirmar la entrega.
- 🔐 **Verificación Anti-Fraude** con un PIN criptográfico de 6 dígitos que el cliente debe entregar al repartidor para desbloquear el pago on-chain.

**Resultado**: Restaurantes ganan 100%. Repartidores ganan 100% de la tarifa. Comisión NODO: **0%**.

---

## Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 16)            │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────┐  │
│  │ Landing  │  │ Customer │  │ Vendor  │  │Courier│  │
│  │  Page    │  │   App    │  │Dashboard│  │  App  │  │
│  └─────────┘  └────┬─────┘  └────┬────┘  └───┬───┘  │
└─────────────────────┼────────────┼────────────┼──────┘
                      │ REST API   │ WebSocket  │ REST
                      ▼            ▼            ▼
┌──────────────────────────────────────────────────────┐
│               BACKEND (Express + Socket.io)          │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │ Auth     │  │ Order     │  │ AI Negotiation   │   │
│  │ JWT+bcrypt│ │ Lifecycle │  │ (Gemini 3.8)     │   │
│  └──────────┘  └─────┬─────┘  └──────────────────┘   │
│                      │                                │
│            ┌─────────▼─────────┐                      │
│            │   Prisma ORM      │                      │
│            │   (SQLite DB)     │                      │
│            └───────────────────┘                      │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│             SMART CONTRACT (Solidity)                │
│  ┌──────────────────────────────────────────────┐    │
│  │  P2PDeliveryEscrow.sol                       │    │
│  │  deposit() → lockFunds → releaseFunds()      │    │
│  │  Anti-fraud PIN verification on delivery      │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Express.js, Socket.io, Prisma ORM |
| Base de Datos | SQLite (dev) / PostgreSQL (prod) |
| IA | Google Gemini 3.8 Flash (Agente Logístico) |
| Auth | JWT + bcrypt |
| Smart Contract | Solidity 0.8.20, Hardhat |
| Real-time | WebSockets (Socket.io) |

---

## Cómo Correrlo

### Prerrequisitos
- Node.js 18+
- npm

### 1. Clonar e instalar

```bash
git clone https://github.com/diegoc1005/p2p-delivery-mvp.git
cd p2p-delivery-mvp
npm install
cd backend && npm install && cd ..
```

### 2. Configurar variables de entorno

```bash
# backend/.env
GEMINI_API_KEY=tu-api-key-de-gemini
JWT_SECRET=nodo_secret_hackathon_2026
```

### 3. Inicializar base de datos

```bash
cd backend
npx prisma db push
npx ts-node prisma/seed.ts
```

### 4. Correr ambos servidores

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

---

## Flujo Demo

### Credenciales de prueba

| Rol | Email | Password |
|-----|-------|----------|
| 🍔 Cliente | demo@nodo.mx | 123456 |
| 🏪 Restaurante | burger@nodo.mx | 123456 |
| 🛵 Courier | courier@nodo.mx | 123456 |

### El "Camino Feliz"

1. **Abre 3 pestañas** en tu navegador
2. **Pestaña 1** → `/auth` → Login como Cliente (demo@nodo.mx)
3. **Pestaña 2** → `/auth` → Login como Restaurante (burger@nodo.mx)
4. **Pestaña 3** → `/auth` → Login como Courier (courier@nodo.mx)
5. **Como Cliente**: Elige un restaurante → Agrega items → Carrito → "Cotizar con IA" → "Confirmar y Pagar"
6. **Como Restaurante**: Verás la orden aparecer en tiempo real → Click "Aceptar y Preparar"
7. **Como Courier**: El viaje aparece → "Aceptar Viaje" → Ingresa el PIN del cliente → "Verificar y Cobrar"
8. **Como Cliente**: Tu tracking se actualiza en vivo mostrando cada paso 🎉

---

## Equipo

Proyecto creado para **GOYA Hack 2026** 🚀

---

<p align="center">
  <em>NODO Protocol — El delivery del futuro no necesita intermediarios.</em>
</p>
