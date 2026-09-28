"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';

type Restaurant = { id: string; name: string; description: string; image: string; category: string; rating: number; deliveryTime: string; distanceKm: number; ownerId: string };
type MenuItem = { id: string; name: string; description: string; price: number; image: string; category: string };
type CartItem = MenuItem & { quantity: number; restaurantId: string };
type Order = { id: string; status: string; foodTotal: number; deliveryFee: number; deliverySecretCode?: string; smartContractTxHash?: string; createdAt: string; restaurant?: { name: string; image: string }; items?: { quantity: number; menuItem: MenuItem }[] };

const API = 'http://localhost:3001';

export default function CustomerApp() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<'home' | 'orders' | 'profile'>('home');
  const [view, setView] = useState<'list' | 'restaurant' | 'cart' | 'tracking'>('list');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // AI negotiation
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [aiBreakdown, setAiBreakdown] = useState<any>(null);
  const [agentStep, setAgentStep] = useState(0);
  const [orderStatus, setOrderStatus] = useState("");

  // Search & filter
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  
  // AI Search
  const [aiQuery, setAiQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Toast
  const [toast, setToast] = useState("");

  // Socket
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'CUSTOMER') {
        router.push(user.role === 'COURIER' ? '/courier' : '/vendor');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetch(`${API}/api/restaurants`).then(r => r.json()).then(setRestaurants).catch(console.error);
  }, []);

  // WebSocket for live tracking
  useEffect(() => {
    if (!user) return;
    const s = io(API);
    s.on('connect', () => {
      s.emit('join_room', `customer_${user.id}`);
    });
    s.on('order_update', (data: any) => {
      setActiveOrder(prev => prev && prev.id === data.id ? { ...prev, status: data.status } : prev);
      setOrders(prev => prev.map(o => o.id === data.id ? { ...o, status: data.status } : o));
      
      let msg = "";
      if (data.status === 'PREPARING') msg = '👨‍🍳 ¡Tu restaurante empezó a preparar tu pedido!';
      if (data.status === 'IN_TRANSIT') msg = '🛵 ¡Tu repartidor va en camino!';
      if (data.status === 'DELIVERED') {
        msg = '🎉 ¡Pedido entregado! Fondos liberados del Escrow';
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
      
      if (msg) {
        showToast(msg);
        if (Notification.permission === "granted") new Notification("Actualización NODO", { body: msg });
      }
    });
    setSocket(s);
    return () => { s.disconnect(); };
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openRestaurant = async (r: Restaurant) => {
    setSelectedRestaurant(r);
    const data = await fetch(`${API}/api/restaurants/${r.id}`).then(r => r.json());
    setMenu(data.menuItems || []);
    setView('restaurant');
  };

  const addToCart = (item: MenuItem) => {
    if (cart.length > 0 && cart[0].restaurantId !== selectedRestaurant?.id) {
      if (!confirm('Tu carrito tiene items de otro restaurante. ¿Reemplazar?')) return;
      setCart([]);
    }
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1, restaurantId: selectedRestaurant!.id }];
    });
    showToast(`✓ ${item.name} agregado`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === id);
      if (ex && ex.quantity > 1) return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter(c => c.id !== id);
    });
  };

  const foodTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const data = await fetch(`${API}/api/orders/user/${user.id}`).then(r => r.json()).catch(() => []);
    setOrders(data);
  }, [user]);

  useEffect(() => { if (tab === 'orders') fetchOrders(); }, [tab, fetchOrders]);

  const negotiate = async () => {
    setIsNegotiating(true); setDeliveryFee(null); setAiBreakdown(null);
    for (let i = 0; i < 5; i++) { setAgentStep(i); await new Promise(r => setTimeout(r, 700)); }
    try {
      const data = await fetch(`${API}/api/orders/negotiate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distanceKm: selectedRestaurant?.distanceKm || 3, weather: "soleado", traffic: "moderado" })
      }).then(r => r.json());
      setDeliveryFee(data.deliveryFee);
      setAiBreakdown(data.breakdown);
      showToast('✅ Tarifa calculada por IA');
    } catch {
      setDeliveryFee(18.5);
      showToast('⚡ Tarifa de contingencia aplicada');
    }
    setIsNegotiating(false);
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiSearching(true);
    try {
      const res = await fetch(`${API}/api/ai/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery })
      });
      const data = await res.json();
      if (data.restaurantId) {
        const found = restaurants.find(r => r.id === data.restaurantId);
        if (found) {
          openRestaurant(found);
          showToast("¡La IA encontró la mejor opción para ti! ✨");
        } else {
          showToast("La IA no encontró una coincidencia exacta.");
        }
      } else {
        showToast("La IA no encontró sugerencias.");
      }
    } catch (e) {
      console.error(e);
      showToast("Error al consultar a Gemini");
    }
    setIsAiSearching(false);
    setAiQuery("");
  };

  const placeOrder = async () => {
    if (!user || !selectedRestaurant) return;
    setOrderStatus("Firmando TX en Soroban...");
    try {
      const res = await fetch(`${API}/api/orders/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: selectedRestaurant.id, customerId: user.id,
          items: cart.map(c => ({ menuItemId: c.id, quantity: c.quantity })),
          deliveryFee: deliveryFee || 18.5
        })
      });
      const data = await res.json();
      console.log('[NODO] Order created:', data);
      if (!res.ok) {
        setOrderStatus(`Error: ${data.error}`);
        showToast('❌ Error al crear la orden');
        return;
      }
      setActiveOrder(data);
      setCart([]);
      setView('tracking');
      setOrderStatus("");
      showToast('✅ ¡Orden creada! Fondos en Escrow');
    } catch (err) {
      console.error('[NODO] Order error:', err);
      setOrderStatus("Error de conexión");
      showToast('❌ Error de conexión con el servidor');
    }
  };

  const agentSteps = [
    { t: "Conectando Agente NODO...", i: "🤖" }, { t: "Consultando clima", i: "🌤️" },
    { t: "Evaluando tráfico", i: "🚦" }, { t: "Calculando ruta óptima", i: "🗺️" },
    { t: "Eliminando comisión del 30%", i: "✨" },
  ];

  const categories = ["Todos", ...new Set(restaurants.map(r => r.category))];
  const filtered = (activeCategory === "Todos" ? restaurants : restaurants.filter(r => r.category === activeCategory))
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()));
  const menuCats = [...new Set(menu.map(m => m.category))];

  const statusSteps = ["ESCROW_LOCKED", "PREPARING", "IN_TRANSIT", "DELIVERED"];
  const statusLabels: Record<string, string> = { ESCROW_LOCKED: "Pago en Escrow ✓", PREPARING: "Restaurante preparando", IN_TRANSIT: "Repartidor en camino", DELIVERED: "Entregado" };
  const currentStatusIdx = activeOrder ? statusSteps.indexOf(activeOrder.status) : 0;

  if (isLoading || !user) return <main className="min-h-screen bg-black flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></main>;

  // ===== BOTTOM NAV COMPONENT =====
  const BottomNav = () => (
    <div className="absolute bottom-0 w-full h-20 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-4 z-30">
      {([
        { key: 'home' as const, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, label: 'Inicio' },
        { key: 'orders' as const, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>, label: 'Órdenes' },
        { key: 'profile' as const, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>, label: 'Perfil' },
      ]).map(n => (
        <button key={n.key} onClick={() => { setTab(n.key); setView('list'); }} className={`flex flex-col items-center gap-1 ${tab === n.key ? 'text-white' : 'text-zinc-600'} transition-colors`}>
          {n.icon}
          <span className="text-[10px] font-semibold">{n.label}</span>
        </button>
      ))}
    </div>
  );

  // ===== TRACKING VIEW =====
  if (view === 'tracking' && activeOrder) return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden flex flex-col relative">
        <div className="h-40 bg-gradient-to-b from-emerald-900/30 to-transparent flex items-center justify-center relative">
          {activeOrder.status !== 'DELIVERED' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-emerald-500/20 rounded-full animate-ping"></div><div className="absolute w-3 h-3 bg-emerald-400 rounded-full"></div></div>}
          {activeOrder.status === 'DELIVERED' && <div className="text-6xl">🎉</div>}
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <h2 className="text-white text-2xl font-bold mb-6">{activeOrder.status === 'DELIVERED' ? '¡Entregado!' : 'Siguiendo tu pedido'}</h2>
          <div className="space-y-5 mb-8">
            {statusSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i <= currentStatusIdx ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700 text-zinc-600'}`}>{i <= currentStatusIdx ? '✓' : i + 1}</div>
                <span className={`text-sm ${i <= currentStatusIdx ? 'text-white font-semibold' : 'text-zinc-600'}`}>{statusLabels[s]}</span>
              </div>
            ))}
          </div>
          {activeOrder.status !== 'DELIVERED' && (
            <>
              {activeOrder.smartContractTxHash && (
                <div className="mb-4 bg-zinc-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">🔗</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Soroban Tx Hash</p>
                    <a href={`https://stellar.expert/explorer/testnet/tx/${activeOrder.smartContractTxHash}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-xs font-mono truncate block underline decoration-purple-500/50">
                      {activeOrder.smartContractTxHash}
                    </a>
                  </div>
                </div>
              )}
              <div className="mt-auto bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 text-center">
                <p className="text-purple-300 text-xs font-bold mb-1">PIN ANTI-FRAUDE</p>
                <p className="text-4xl font-black text-white tracking-[0.3em] font-mono">{activeOrder.deliverySecretCode}</p>
                <p className="text-zinc-500 text-xs mt-2">Muéstralo al repartidor cuando llegue.</p>
              </div>
            </>
          )}
          
          <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
            <h3 className="text-white font-bold text-sm mb-2">Detalle del Pedido</h3>
            {activeOrder.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-zinc-400 text-xs">
                <span>{item.quantity}x {item.menuItem?.name}</span>
                <span>${(item.menuItem?.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-zinc-400 text-xs mt-2 pt-2 border-t border-white/5">
              <span>Tarifa de Envío NODO</span>
              <span>${activeOrder.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-sm mt-1">
              <span>Total Pagado</span>
              <span className="text-emerald-400">${(activeOrder.foodTotal + activeOrder.deliveryFee).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button onClick={() => { setActiveOrder(null); setView('list'); setTab('home'); setDeliveryFee(null); }} className="py-3 rounded-xl bg-white/5 text-zinc-400 text-sm font-semibold hover:bg-white/10 transition-colors text-center">Volver al inicio</button>
            <button onClick={() => setToast("Disputa iniciada: El Smart Contract revisará el GPS del repartidor y te reembolsará si hubo fraude.")} className="py-3 text-red-500/80 text-xs font-semibold hover:text-red-400 underline decoration-red-500/50">
               ⚠️ ¿Problemas con tu pedido? Iniciar disputa
             </button>
          </div>
        </div>
      </div>
    </main>
  );

  // ===== CART VIEW =====
  if (view === 'cart') return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden flex flex-col">
        <div className="px-6 pt-14 pb-4 flex items-center gap-4 border-b border-white/5">
          <button onClick={() => setView('restaurant')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
          <h2 className="text-white text-xl font-bold">Tu Carrito</h2>
          <span className="ml-auto text-zinc-500 text-sm">{cartCount} items</span>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4 no-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between py-4 border-b border-white/5">
              <div className="flex items-center gap-3"><span className="text-2xl">{item.image}</span><div><p className="text-white font-medium text-sm">{item.name}</p><p className="text-zinc-500 text-xs">${item.price} c/u</p></div></div>
              <div className="flex items-center gap-3">
                <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full bg-white/5 text-white text-sm flex items-center justify-center hover:bg-red-500/20">−</button>
                <span className="text-white font-bold w-4 text-center">{item.quantity}</span>
                <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-full bg-white/5 text-white text-sm flex items-center justify-center hover:bg-emerald-500/20">+</button>
              </div>
            </div>
          ))}
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span className="text-white">${foodTotal.toFixed(2)}</span></div>
            {!deliveryFee && !isNegotiating && <button onClick={negotiate} className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_30px_rgba(147,51,234,0.3)]"><span className="text-lg">🤖</span> Cotizar Envío con IA</button>}
            {isNegotiating && (
              <div className="mt-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3"><div className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-purple-400 opacity-75"></span><span className="relative rounded-full h-2.5 w-2.5 bg-purple-500"></span></div><span className="font-mono text-purple-400 text-xs tracking-widest">AGENTE ACTIVO</span></div>
                {agentSteps.map((s, i) => (<div key={i} className={`flex items-center gap-2 text-xs font-medium py-1 transition-all ${i === agentStep ? 'text-white' : i < agentStep ? 'text-emerald-500' : 'text-zinc-700'}`}><span>{s.i}</span><span>{s.t}</span></div>))}
              </div>
            )}
            {deliveryFee && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center text-emerald-400 font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mt-4"><span>⚡ Envío NODO</span><div className="flex items-center gap-2"><span className="text-xs line-through text-zinc-500">${(deliveryFee * 2.5).toFixed(0)}</span><span>${deliveryFee.toFixed(2)}</span></div></div>
                
                {aiBreakdown && (
                  <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-zinc-400 space-y-1">
                    <p className="text-white font-semibold mb-2">Desglose de la IA:</p>
                    <div className="flex justify-between"><span>Base</span><span>${aiBreakdown.base?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Distancia ({selectedRestaurant?.distanceKm}km)</span><span>${aiBreakdown.distance?.toFixed(2)}</span></div>
                    {aiBreakdown.weather > 0 && <div className="flex justify-between"><span>Clima Lluvioso</span><span>+${aiBreakdown.weather?.toFixed(2)}</span></div>}
                    {aiBreakdown.traffic > 0 && <div className="flex justify-between"><span>Tráfico Alto</span><span>+${aiBreakdown.traffic?.toFixed(2)}</span></div>}
                    <p className="text-zinc-500 italic mt-2 pt-2 border-t border-white/10">{aiBreakdown.reason}</p>
                  </div>
                )}
                
                <div className="flex justify-between text-white font-bold text-lg mt-6 pt-4 border-t border-white/10"><span>Total</span><span>${(foodTotal + deliveryFee).toFixed(2)}</span></div>
                <button onClick={placeOrder} disabled={!!orderStatus} className="w-full mt-6 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-200 disabled:opacity-50 transition-all">{orderStatus || 'Confirmar y Pagar'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );

  // ===== RESTAURANT VIEW =====
  if (view === 'restaurant' && selectedRestaurant) return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden flex flex-col relative">
        <div className="h-44 bg-gradient-to-br from-purple-900/40 to-black relative flex items-end px-6 pb-5">
          <button onClick={() => setView('list')} className="absolute top-12 left-5 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white z-10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
          <div className="absolute top-8 right-6 text-6xl opacity-30">{selectedRestaurant.image}</div>
          <div><h2 className="text-white text-2xl font-bold tracking-tight">{selectedRestaurant.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-zinc-400 text-xs"><span>⭐ {selectedRestaurant.rating}</span><span>•</span><span>{selectedRestaurant.deliveryTime}</span><span>•</span><span>{selectedRestaurant.distanceKm}km</span></div>
            {selectedRestaurant.description && <p className="text-zinc-500 text-xs mt-2">{selectedRestaurant.description}</p>}
          </div>
        </div>
        <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5">
          {menuCats.map(cat => (<button key={cat} className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white/5 text-zinc-300 border border-white/5">{cat}</button>))}
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar">
          {menuCats.map(cat => (
            <div key={cat} className="mt-6">
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3">{cat}</h3>
              {menu.filter(m => m.category === cat).map(item => (
                <div key={item.id} className="flex items-center justify-between py-4 border-b border-white/5 group">
                  <div className="flex items-center gap-3 flex-1 min-w-0"><span className="text-3xl shrink-0">{item.image}</span><div className="min-w-0"><p className="text-white font-medium text-sm truncate">{item.name}</p><p className="text-zinc-600 text-xs truncate">{item.description}</p><p className="text-white font-bold text-sm mt-1">${item.price}</p></div></div>
                  <button onClick={() => addToCart(item)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all shrink-0 ml-3 text-lg">+</button>
                </div>
              ))}
            </div>
          ))}
        </div>
        {cartCount > 0 && (
          <div className="absolute bottom-8 left-5 right-5 z-20">
            <button onClick={() => setView('cart')} className="w-full flex items-center justify-between bg-white text-black py-4 px-6 rounded-2xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3"><span className="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">{cartCount}</span><span>Ver carrito</span></div>
              <span>${foodTotal.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );

  // ===== ORDERS TAB =====
  if (tab === 'orders') return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden flex flex-col relative">
        <div className="px-6 pt-14 pb-4 border-b border-white/5"><h2 className="text-white text-2xl font-bold">Mis Órdenes</h2></div>
        <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
          {orders.length === 0 && <div className="flex flex-col items-center justify-center h-full text-zinc-600"><svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg><p className="text-sm">Aún no tienes órdenes</p></div>}
          {orders.map(o => (
            <button key={o.id} onClick={() => { setActiveOrder(o); setView('tracking'); }} className="w-full text-left py-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="flex justify-between items-start">
                <div><p className="text-white font-semibold text-sm">{o.restaurant?.name || 'Pedido'}</p><p className="text-zinc-600 text-xs mt-1">#{o.id.substring(0, 8)} • {new Date(o.createdAt).toLocaleDateString()}</p></div>
                <div className="text-right"><span className={`text-xs font-bold px-2 py-1 rounded-lg ${o.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>{o.status}</span><p className="text-white font-bold mt-2 text-sm">${(o.foodTotal + o.deliveryFee).toFixed(2)}</p></div>
              </div>
            </button>
          ))}
        </div>
        <BottomNav />
      </div>
    </main>
  );

  // ===== PROFILE TAB =====
  if (tab === 'profile') return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden flex flex-col relative">
        <div className="px-6 pt-14 pb-4 border-b border-white/5"><h2 className="text-white text-2xl font-bold">Mi Perfil</h2></div>
        <div className="flex-1 px-6 pt-6 pb-24 no-scrollbar">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-emerald-400 flex items-center justify-center text-2xl font-bold text-white">{user.name.charAt(0)}</div>
            <div><p className="text-white font-bold text-lg">{user.name}</p><p className="text-zinc-500 text-sm">{user.email}</p></div>
          </div>
          <div className="space-y-3">
            {[
              { icon: '📍', label: 'Dirección', value: 'Casa - Calle Principal 123' },
              { icon: '🔑', label: 'Rol', value: user.role === 'CUSTOMER' ? 'Cliente' : user.role },
              { icon: '💳', label: 'Wallet Soroban', value: 'Conectar wallet...' },
              { icon: '🤖', label: 'Agente IA', value: 'Gemini 2.0 Flash' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3"><span>{item.icon}</span><span className="text-zinc-400 text-sm">{item.label}</span></div>
                <span className="text-white text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <button onClick={logout} className="w-full mt-8 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors">Cerrar Sesión</button>
        </div>
        <BottomNav />
      </div>
    </main>
  );

  // ===== HOME TAB =====
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden flex flex-col relative">
        <div className="px-6 pt-14 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div><p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Entregar en</p><h2 className="text-white text-base font-bold flex items-center gap-1">Casa - Calle Principal 123 <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></h2></div>
            <img src="/logo.jpg" alt="NODO" className="w-9 h-9 rounded-full object-cover shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
          </div>
          <form onSubmit={handleAiSearch} className="relative mb-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {isAiSearching ? <svg className="w-4 h-4 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"/></svg> : <span className="text-purple-500">✨</span>}
            </div>
            <input type="text" placeholder="Pídele a Gemini (Ej. Tengo $15 y antojo de pizza)" value={aiQuery} onChange={e => setAiQuery(e.target.value)} disabled={isAiSearching} className="w-full bg-purple-500/10 border border-purple-500/30 rounded-2xl py-3 pl-11 pr-4 text-sm text-purple-100 focus:outline-none focus:border-purple-500 placeholder:text-purple-400/50" />
          </form>
          <div className="relative"><svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg><input type="text" placeholder="Buscar restaurantes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 placeholder:text-zinc-600" /></div>
        </div>
        <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>{cat}</button>))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-4 mb-4">{filtered.length} restaurantes</h3>
          <div className="space-y-4">
            {filtered.map(r => (
              <button key={r.id} onClick={() => openRestaurant(r)} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.05] transition-all active:scale-[0.98] text-left group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{r.image}</div>
                <div className="flex-1 min-w-0"><h4 className="text-white font-bold truncate">{r.name}</h4><p className="text-zinc-500 text-xs mt-0.5">{r.category} • {r.distanceKm}km</p><div className="flex items-center gap-3 mt-2"><span className="text-xs text-yellow-500 font-bold">⭐ {r.rating}</span><span className="text-xs text-zinc-600">{r.deliveryTime}</span></div></div>
                <svg className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>

      {/* Toast */}
      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-3 rounded-full font-semibold text-sm shadow-2xl z-50 animate-in fade-in">{toast}</div>}
    </main>
  );
}
