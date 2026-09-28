"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { RampWidget } from '@pollar/react';
const API = `${process.env.NEXT_PUBLIC_API_URL || "https://nodo-5e4t.onrender.com"}`;

export default function CourierDashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [phase, setPhase] = useState<'scanning' | 'available' | 'delivering' | 'done'>('scanning');
  const [secretCode, setSecretCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [tab, setTab] = useState<'home' | 'history' | 'profile'>('home');
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<any>(null);
  const [showPollarRamp, setShowPollarRamp] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth');
      } else if (user.role !== 'COURIER') {
        router.push(user.role === 'RESTAURANT' ? '/vendor' : '/customer');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (tab === 'history' && user) {
      fetch(`${API}/api/orders/courier/${user.id}`)
        .then(r => r.json())
        .then(data => setHistoryOrders(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  }, [tab, user]);

  // Check for active order on mount
  useEffect(() => {
    if (user && phase === 'scanning') {
      fetch(`${API}/api/orders/courier/${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const active = data.find(o => o.status === 'IN_TRANSIT');
            if (active) {
              setActiveOrder(active);
              setPhase('delivering');
            }
          }
        })
        .catch(console.error);
    }
  }, [user]);

  // Poll for available orders
  useEffect(() => {
    if (!user || tab !== 'home') return;
    let active = true;
    const poll = async () => {
      try {
        const data = await fetch(`${API}/api/orders/available/list`).then(r => r.json());
        if (active && data.length > 0) { setOrders(data); setPhase('available'); }
        else if (active) setTimeout(poll, 3000);
      } catch { if (active) setTimeout(poll, 3000); }
    };
    if (phase === 'scanning') poll();
    return () => { active = false; };
  }, [user, phase, tab]);

  const acceptOrder = async (order: any) => {
    try {
      const data = await fetch(`${API}/api/orders/${order.id}/accept`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierId: user?.id })
      }).then(r => r.json());
      setActiveOrder({ ...order, ...data });
      setPhase('delivering');
    } catch (err) { console.error(err); }
  };

  const confirmDelivery = async () => {
    if (secretCode.length !== 6) { setErrorMsg("Ingresa los 6 dígitos"); return; }
    setErrorMsg(""); setIsProcessing(true);
    try {
      const res = await fetch(`${API}/api/orders/${activeOrder.id}/deliver`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode })
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error); setIsProcessing(false); return; }
      setPhase('done');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch { setErrorMsg("Error de red"); }
    setIsProcessing(false);
  };

  const forceDispute = async () => {
    setIsProcessing(true);
    setErrorMsg("Iniciando disputa descentralizada...");
    
    // Simulate GPS Oracle verification
    setTimeout(async () => {
       setErrorMsg("Oráculo GPS verificado. Forzando Smart Contract...");
       try {
        const res = await fetch(`${API}/api/orders/${activeOrder.id}/deliver`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secretCode: activeOrder.deliverySecretCode }) // Bypass using actual code
        });
        const data = await res.json();
        if (!res.ok) { setErrorMsg(data.error); setIsProcessing(false); return; }
        setPhase('done');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
       } catch {
          setErrorMsg("Error forzando el contrato");
       }
       setIsProcessing(false);
    }, 2500);
  };

  if (isLoading || !user) return null;

  const totalEarnings = historyOrders.filter(o => o.status === 'DELIVERED').reduce((acc, o) => acc + o.deliveryFee, 0);

  const BottomNav = () => (
    <div className="absolute bottom-0 w-full h-20 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-4 z-30">
      {([
        { key: 'home' as const, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, label: 'Inicio' },
        { key: 'history' as const, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, label: 'Ingresos' },
        { key: 'profile' as const, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>, label: 'Perfil' },
      ]).map(n => (
        <button key={n.key} onClick={() => setTab(n.key)} className={`flex flex-col items-center gap-1 ${tab === n.key ? 'text-white' : 'text-zinc-600'} transition-colors`}>
          {n.icon}
          <span className="text-[10px] font-semibold">{n.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px] h-[800px] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="px-6 pt-14 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="NODO" className="w-8 h-8 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
            <div><p className="text-white font-bold">NODO Repartidor</p><p className="text-zinc-600 text-xs">{user.name}</p></div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col overflow-y-auto pb-24 no-scrollbar">
          
          {/* TAB: HOME */}
          {tab === 'home' && (
            <>
              {/* SCANNING */}
              {phase === 'scanning' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 border-2 border-emerald-500/30 rounded-full animate-ping absolute"></div>
                    <div className="w-20 h-20 border-2 border-emerald-500/10 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"/></svg>
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">Escaneando Red P2P</h3>
                  <p className="text-zinc-600 text-sm">Buscando órdenes cerca de ti...</p>
                </div>
              )}

              {/* AVAILABLE ORDERS */}
              {phase === 'available' && (
                <>
                  <h3 className="text-white font-bold text-lg mb-4">{orders.length} Viajes Disponibles</h3>
                  <div className="flex-1 space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white font-bold">{order.restaurant?.name || 'Restaurante'}</p>
                            <p className="text-zinc-500 text-xs mt-1">#{order.id.substring(0, 8)} • {order.restaurant?.distanceKm || '?'}km</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-black text-xl">${order.deliveryFee}</p>
                            <p className="text-zinc-600 text-xs">100% tuyo</p>
                          </div>
                        </div>
                        {order.items && (
                          <div className="text-xs text-zinc-500 mb-3">
                            {order.items.map((i: any, idx: number) => <span key={idx}>{i.quantity}x {i.menuItem?.name}{idx < order.items.length - 1 ? ', ' : ''}</span>)}
                          </div>
                        )}
                        <button onClick={() => acceptOrder(order)} className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors active:scale-[0.98]">
                          Aceptar Viaje
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* DELIVERING */}
              {phase === 'delivering' && activeOrder && (
                <>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 mb-6">
                    <h3 className="text-white font-bold text-lg mb-1">En Ruta</h3>
                    <p className="text-zinc-500 text-sm mb-4">Recoger en: <strong className="text-white">{activeOrder.restaurant?.name || 'Restaurante'}</strong></p>
                    
                    {/* Simulated GPS Map */}
                    <div className="w-full h-32 bg-zinc-900 rounded-xl border border-white/10 mb-4 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                      {!hasArrived ? (
                        <div className="flex flex-col items-center z-10">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping mb-2"></div>
                          <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Navegando...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center z-10">
                          <div className="text-3xl mb-1 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">📍</div>
                          <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Destino Alcanzado</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-zinc-400 text-sm">Tu ganancia</span>
                      <span className="text-emerald-400 font-black text-2xl">${activeOrder.deliveryFee}</span>
                    </div>
                  </div>

                  {!hasArrived ? (
                    <button onClick={() => setHasArrived(true)} className="w-full py-4 rounded-xl bg-blue-500 text-white font-black text-lg hover:bg-blue-400 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      He llegado al cliente
                    </button>
                  ) : (
                    <>
                      <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/30">
                        <h4 className="text-emerald-400 font-bold text-sm mb-2">Verificación Anti-Fraude</h4>
                        <p className="text-emerald-200/60 text-xs mb-4">Pide el PIN de 6 dígitos al cliente.</p>
                        <input type="text" placeholder="000000" maxLength={6} value={secretCode} onChange={e => setSecretCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 border-2 border-emerald-500/50 rounded-xl focus:outline-none focus:border-emerald-400 text-white bg-black" />
                        {errorMsg && <p className="text-red-400 text-xs mt-2 font-bold text-center">{errorMsg}</p>}
                      </div>
                      <button onClick={confirmDelivery} disabled={isProcessing || secretCode.length !== 6}
                        className="mt-6 w-full py-4 rounded-2xl bg-emerald-500 text-black font-black text-lg hover:bg-emerald-600 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
                        {isProcessing && !errorMsg.includes("Oráculo") ? <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"/></svg> Ejecutando Soroban...</> : 'Verificar PIN y Cobrar'}
                      </button>

                      {/* Dispute Feature */}
                      <button onClick={forceDispute} disabled={isProcessing} className="mt-4 w-full py-3 text-red-400 text-sm font-bold hover:text-red-300 transition-colors disabled:opacity-50 flex flex-col items-center">
                        <span>¿El cliente no responde o no da el PIN?</span>
                        <span className="text-red-500/50 text-xs mt-1 underline">Forzar Liberación (Verificación GPS)</span>
                      </button>
                    </>
                  )}
                </>
              )}

              {/* DONE */}
              {phase === 'done' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
                  <div className="text-6xl mb-6">🎉</div>
                  <h3 className="text-white font-bold text-2xl mb-2">¡Cobro exitoso!</h3>
                  <p className="text-zinc-500 text-sm mb-2">Fondos liberados del Smart Contract</p>
                  <p className="text-emerald-400 font-black text-4xl mb-8">${activeOrder?.deliveryFee}</p>
                  <button onClick={() => { setPhase('scanning'); setActiveOrder(null); setSecretCode(""); setHasArrived(false); }} className="py-3 px-8 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-white/10 transition-colors">
                    Buscar más viajes
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB: HISTORY */}
          {tab === 'history' && (
            <div className="animate-in fade-in">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 mb-6 text-center">
                <p className="text-emerald-400 font-bold text-sm mb-1">Total Generado (100% tuyo)</p>
                <p className="text-white font-black text-4xl">${totalEarnings.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => setShowPollarRamp(true)}
                className="w-full mb-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <span>🐻‍❄️</span> Retirar a Banco Local (vía Pollar)
              </button>
              
              <h3 className="text-white font-bold text-lg mb-4">Historial de Viajes</h3>
              {historyOrders.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center mt-10">Aún no has completado viajes.</p>
              ) : (
                <div className="space-y-3">
                  {historyOrders.map(order => (
                    <div key={order.id} onClick={() => setSelectedHistoryOrder(order)} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
                      <div>
                        <p className="text-white font-semibold text-sm">{order.restaurant?.name || 'Restaurante'}</p>
                        <p className="text-zinc-500 text-xs mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">+${order.deliveryFee}</p>
                        <p className="text-xs text-zinc-500">{order.status === 'DELIVERED' ? 'Completado' : 'En proceso'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Details Modal */}
              {selectedHistoryOrder && (
                <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-6" onClick={() => setSelectedHistoryOrder(null)}>
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold text-lg">Detalles del Pedido</h3>
                      <button onClick={() => setSelectedHistoryOrder(null)} className="text-zinc-500 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-zinc-500 text-xs">Restaurante</p>
                        <p className="text-white text-sm font-semibold">{selectedHistoryOrder.restaurant?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs">Fecha</p>
                        <p className="text-white text-sm">{new Date(selectedHistoryOrder.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs">ID de Pedido</p>
                        <p className="text-white text-xs font-mono break-all">{selectedHistoryOrder.id}</p>
                      </div>
                      {selectedHistoryOrder.smartContractTxHash && (
                        <div>
                          <p className="text-zinc-500 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Soroban Smart Contract
                          </p>
                          <a href={`https://stellar.expert/explorer/testnet/tx/${selectedHistoryOrder.smartContractTxHash}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-xs font-mono break-all hover:underline">
                            {selectedHistoryOrder.smartContractTxHash}
                          </a>
                        </div>
                      )}
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-zinc-400 text-sm">Tu Ganancia</span>
                        <span className="text-emerald-400 font-black text-xl">${selectedHistoryOrder.deliveryFee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {tab === 'profile' && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in pt-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-4xl font-bold mb-4">{user.name.charAt(0)}</div>
              <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-zinc-500 text-sm mb-8">{user.email}</p>
              <div className="w-full bg-white/5 rounded-2xl p-4 space-y-4 text-left border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Vehículo</span>
                  <span className="text-white font-semibold text-sm">Motocicleta</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Wallet conectada</span>
                  <span className="text-blue-400 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded-md">GBX4...L9V2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Comisión NODO</span>
                  <span className="text-emerald-400 font-bold text-sm">0%</span>
                </div>
              </div>
              <button className="w-full mt-6 py-4 rounded-xl border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10 transition-colors" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>
          )}

        </div>

        {/* Render Bottom Nav only if not actively delivering */}
        {phase !== 'delivering' && phase !== 'done' && <BottomNav />}
        
        {showPollarRamp && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 rounded-[40px]">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden relative shadow-2xl">
              {/* @ts-ignore */}
              <RampWidget direction="sell" onClose={() => setShowPollarRamp(false)} />
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
