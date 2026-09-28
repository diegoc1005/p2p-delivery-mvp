"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { WalletButton, usePollar } from '@pollar/react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login, register } = useAuth();
  
  // Safe extraction of usePollar to avoid errors if not fully loaded
  const pollar = typeof usePollar === 'function' ? usePollar() : { isAuthenticated: false };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) await login(email, password);
      else await register(email, password, name, role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string) => {
    setLoading(true);
    setError('');
    try { await login(email, '123456'); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/logo.jpg" alt="NODO" className="w-12 h-12 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
            <span className="font-black text-3xl tracking-tight">NODO</span>
          </Link>
          <p className="text-zinc-500 text-sm">Delivery descentralizado. Cero comisiones.</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-6 text-center">
            {isLogin ? 'Acceso al Protocolo' : 'Unirse a NODO'}
          </h2>

          <div className="flex flex-col items-center justify-center mb-4 min-h-[48px] gap-4">
            {mounted && <WalletButton />}
            
            {mounted && pollar?.isAuthenticated && (
              <div className="w-full mt-2 animate-in fade-in zoom-in slide-in-from-top-4 duration-500">
                <button 
                  onClick={() => quickLogin('demo@nodo.mx')} 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
                >
                  Continuar como Cliente 🚀
                </button>
              </div>
            )}
          </div>
          
          <div className="relative flex py-4 items-center">
             <div className="flex-grow border-t border-zinc-700"></div>
             <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs">O INGRESA CON CORREO</span>
             <div className="flex-grow border-t border-zinc-700"></div>
          </div>

          {error && <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input type="text" placeholder="Tu nombre" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" value={name} onChange={e => setName(e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  {[{v:'CUSTOMER',l:'🍔 Cliente'},{v:'RESTAURANT',l:'🏪 Negocio'},{v:'COURIER',l:'🛵 Repartidor'}].map(r => (
                    <button key={r.v} type="button" onClick={() => setRole(r.v)} className={`py-3 rounded-xl text-xs font-bold border transition-all ${role === r.v ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'}`}>{r.l}</button>
                  ))}
                </div>
              </>
            )}
            <input type="email" placeholder="Correo electrónico" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50">
              {loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-5 text-center text-zinc-500 text-sm">
            {isLogin ? '¿Nuevo en NODO?' : '¿Ya tienes cuenta?'}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-1 text-white font-semibold hover:text-purple-400 transition-colors">
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        {/* Quick Demo Access */}
        <div className="mt-8 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">Acceso Rápido (Demo)</p>
          <div className="space-y-2">
            <button onClick={() => quickLogin('demo@nodo.mx')} className="w-full py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold hover:bg-purple-500/20 transition-colors">🍔 Entrar como Cliente</button>
            <div className="relative">
              <select onChange={(e) => { if (e.target.value) quickLogin(e.target.value); }} className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold focus:outline-none appearance-none text-center cursor-pointer hover:bg-emerald-500/20 transition-colors">
                <option value="">🏪 Elige un Restaurante...</option>
                <option value="burger@nodo.mx">Burger Joint MX</option>
                <option value="sushi@nodo.mx">Sushi Neko</option>
                <option value="tacos@nodo.mx">Taquería El Patrón</option>
                <option value="pizza@nodo.mx">Pizza Fuego</option>
                <option value="healthy@nodo.mx">Green Bowl Co.</option>
              </select>
            </div>
            <button onClick={() => quickLogin('courier@nodo.mx')} className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 transition-colors">🛵 Entrar como Repartidor</button>
          </div>
        </div>
      </div>
    </main>
  );
}
