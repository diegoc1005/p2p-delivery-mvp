"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { RampWidget } from '@pollar/react';
const API = `${process.env.NEXT_PUBLIC_API_URL || "https://nodo-5e4t.onrender.com"}`;

export default function VendorDashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState("Conectando...");
  const [showPollarRamp, setShowPollarRamp] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'RESTAURANT') {
        router.push(user.role === 'COURIER' ? '/courier' : '/customer');
      }
    }
    if (user && user.role === 'RESTAURANT') {
      fetch(`${API}/api/orders/vendor/${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const socket = io(API);
    socket.on('connect', () => {
      setStatus("🟢 Online");
      socket.emit('join_room', `vendor_${user.id}`);
    });
    socket.on('new_order', (order: any) => {
      setOrders(prev => [order, ...prev]);
      if (Notification.permission === "granted") new Notification("¡Nueva Orden NODO!", { body: `$${order.foodTotal}` });
    });
    socket.on('disconnect', () => setStatus("🔴 Offline"));
    return () => { socket.disconnect(); };
  }, [user]);

  const markPreparing = async (orderId: string) => {
    await fetch(`${API}/api/orders/${orderId}/prepare`, { method: 'POST' });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PREPARING' } : o));
  };

  if (isLoading || !user) return null;

  const todaySales = orders.reduce((acc, o) => acc + o.foodTotal, 0);
  const savedFromRappi = todaySales * 0.3; // 30% comission saved
  
  // Advanced Metrics
  const productCount: Record<string, number> = {};
  const customerCount: Record<string, number> = {};
  
  orders.forEach(o => {
    customerCount[o.customerId] = (customerCount[o.customerId] || 0) + 1;
    o.items?.forEach((i: any) => {
      const name = i.menuItem?.name || 'Producto';
      productCount[name] = (productCount[name] || 0) + i.quantity;
    });
  });

  const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topCustomerStr = Object.entries(customerCount).sort((a, b) => b[1] - a[1])[0]?.[0]?.substring(0, 5) || "N/A";

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="NODO" className="w-10 h-10 rounded-lg shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Terminal Vendor</h1>
              <p className="text-zinc-500 text-sm">{user.name} ({user.email})</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full font-mono text-sm">{status}</span>
            <button onClick={logout} className="text-zinc-500 text-sm hover:text-red-400 transition-colors">Salir</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders Column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold mb-2">Órdenes en Vivo</h2>

            {orders.length === 0 && (
              <div className="py-24 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-zinc-500">
                <svg className="w-12 h-12 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p className="text-sm">Esperando pedidos P2P...</p>
                <p className="text-xs text-zinc-700 mt-1">Las órdenes aparecerán aquí en tiempo real.</p>
              </div>
            )}

            {orders.map(order => (
              <div key={order.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden animate-in fade-in hover:bg-white/[0.03] transition-colors">
                <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_20px_#10b981]"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${order.status === 'ESCROW_LOCKED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : order.status === 'PREPARING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{order.status}</span>
                    <h3 className="font-bold text-xl mt-3 text-white">Pedido</h3>
                    <p className="text-zinc-500 text-xs font-mono mt-1">#{order.id.substring(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Ingreso</p>
                    <p className="font-bold text-2xl text-emerald-400">${order.foodTotal}</p>
                  </div>
                </div>

                {/* Items */}
                {order.items && (
                  <div className="bg-black/40 rounded-xl p-3 mb-4 space-y-2">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-zinc-300">{item.quantity}x {item.menuItem?.name}</span>
                        <span className="text-zinc-500">${(item.menuItem?.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Secret Code */}
                <div className="bg-black/40 p-3 rounded-xl font-mono text-sm text-zinc-400 flex justify-between items-center mb-4">
                  <span>PIN Anti-Fraude:</span>
                  <span className="text-lg text-white font-bold tracking-widest">{order.deliverySecretCode}</span>
                </div>

                {/* Actions */}
                {order.status === 'ESCROW_LOCKED' && (
                  <button onClick={() => markPreparing(order.id)} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors">
                    Aceptar y Preparar 👨‍🍳
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <div className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm text-center">
                    ⏳ Preparando... Esperando repartidor
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Metrics Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <h3 className="font-semibold text-lg mb-6 text-white">Métricas Hoy</h3>
              <div className="space-y-6">
                <div><p className="text-zinc-500 text-sm mb-1">Ventas</p><p className="font-black text-3xl text-white">${todaySales.toFixed(2)}</p></div>
                <div><p className="text-zinc-500 text-sm mb-1">Comisiones NODO</p><p className="font-black text-3xl text-emerald-400">$0.00</p></div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"><p className="text-emerald-400 text-sm font-bold">💰 Ahorro vs Rappi</p><p className="text-2xl font-black text-emerald-400 mt-1">${savedFromRappi.toFixed(2)}</p></div>
              </div>
              <button 
                onClick={() => setShowPollarRamp(true)}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <span>🐻‍❄️</span> Retirar a Banco Local (vía Pollar)
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <h3 className="font-semibold text-lg mb-4 text-white">Análisis de Datos IA 🤖</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Más Vendidos</p>
                  {topProducts.length === 0 ? <p className="text-zinc-600 text-sm">Sin datos</p> : topProducts.map(([name, qty]) => (
                    <div key={name} className="flex justify-between items-center text-sm py-1 border-b border-white/5">
                      <span className="text-zinc-300 truncate pr-2">{name}</span>
                      <span className="font-bold text-white bg-white/10 px-2 rounded-md">{qty}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Mejor Cliente Hoy</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">👤</div>
                    <p className="text-white text-sm font-mono">Usuario_{topCustomerStr}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <h3 className="font-semibold mb-3 text-white">Órdenes Totales</h3>
              <p className="text-4xl font-black text-white">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {showPollarRamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden relative shadow-2xl">
            {/* @ts-ignore */}
            <RampWidget direction="sell" onClose={() => setShowPollarRamp(false)} />
          </div>
        </div>
      )}
    </main>
  );
}
