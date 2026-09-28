import Link from 'next/link';

function AnimatedCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={`relative overflow-hidden rounded-[32px] bg-white/[0.02] border border-white/[0.05] p-10 group hover:bg-white/[0.04] transition-all duration-500 ${className}`}
      style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-50 selection:bg-white/20 overflow-hidden font-sans">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-purple-500/20 via-transparent to-transparent blur-3xl rounded-full pointer-events-none opacity-50"></div>
      <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="NODO Logo" className="w-8 h-8 rounded-lg object-cover shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <span className="font-bold text-xl tracking-tight">NODO</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="#como-funciona" className="hover:text-white transition-colors duration-300">Cómo Funciona</a>
            <a href="#arquitectura" className="hover:text-white transition-colors duration-300">Arquitectura</a>
            <a href="#metricas" className="hover:text-white transition-colors duration-300">Números</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="hidden md:flex items-center justify-center text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/auth" className="flex items-center justify-center h-8 px-4 rounded-full text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-40 pb-24 md:pb-32 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-zinc-300 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-1000">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Hackathon GOYA HACK 2026
        </div>
        
        <div className="relative inline-block">
          {/* N Background image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 opacity-20 pointer-events-none mix-blend-screen blur-sm">
            <img src="/logo-n.jpg" alt="N Background" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="relative font-bold tracking-tighter leading-[1.1] mb-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 z-10">
            <span className="block text-[4rem] sm:text-[6rem] md:text-[10rem] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 leading-none mb-2">
              NODO
            </span>
            <span className="text-4xl sm:text-5xl md:text-6xl">
              Delivery, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                descentralizado.
              </span>
            </span>
          </h1>
        </div>
        
        <p className="relative text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 font-light leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 px-4 z-10">
          Bienvenido a <strong className="text-white font-bold">NODO</strong>. Olvídate del 30% de comisión. Un protocolo impulsado por <strong className="text-zinc-200 font-medium">Agentes de IA</strong> que negocian precios justos, asegurado por smart contracts en <strong className="text-zinc-200 font-medium">Blockchain</strong>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500 px-4">
          <Link href="/customer" className="flex items-center justify-center h-12 px-8 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            Probar como Cliente
          </Link>
          <Link href="/courier" className="flex items-center justify-center h-12 px-8 rounded-full bg-white/[0.05] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.1] hover:scale-105 active:scale-95 transition-all">
            Probar como Repartidor
          </Link>
        </div>
      </section>

      {/* Video Explicativo */}
      <section className="max-w-5xl mx-auto px-6 pb-24 md:pb-32 z-10 relative">
        <div className="aspect-video w-full bg-zinc-900/50 border border-white/10 rounded-[40px] overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-emerald-500/10"></div>
          {/* Video Real */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-10"
            src="/nodo-manifesto.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 pointer-events-none"></div>
          <div className="absolute bottom-6 left-6 z-30">
            <p className="text-white font-bold text-lg">Manifiesto NODO</p>
            <p className="text-emerald-400 text-sm font-medium">Delivery descentralizado</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-24 md:py-32 z-10 relative">
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">El Protocolo</p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Cómo funciona NODO</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { step: "01", icon: "🍔", title: "Elige tu comida", desc: "Navega restaurantes cercanos y agrega lo que quieras al carrito. Sin precios inflados." },
            { step: "02", icon: "🤖", title: "La IA negocia", desc: "Un agente Gemini analiza tráfico, clima y distancia para calcular una tarifa justa en 400ms." },
            { step: "03", icon: "⛓️", title: "Escrow on-chain", desc: "Tu pago se bloquea en un smart contract. Nadie toca el dinero hasta la entrega." },
            { step: "04", icon: "🔐", title: "PIN Anti-Fraude", desc: "Recibes un PIN de 6 dígitos. Solo si coincide, el contrato libera los fondos al repartidor." },
          ].map((s, i) => (
            <div key={i} className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 hover:bg-white/[0.04] transition-all group">
              <div className="absolute top-6 right-6 text-zinc-800 text-4xl font-black">{s.step}</div>
              <div className="text-4xl mb-6">{s.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="max-w-6xl mx-auto px-6 py-24 md:py-32 z-10 relative border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Ganan Todos</p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight">El ecosistema justo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard>
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-white mb-2">Para Restaurantes</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">Di adiós al 30% de comisión. Vende al precio real de tu menú y obtén liquidaciones instantáneas en USDC sin esperar cortes semanales.</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 0% comisión por venta</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Liquidación atómica</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Control de tu clientela</li>
            </ul>
          </AnimatedCard>
          <AnimatedCard delay={100}>
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-white mb-2">Para Clientes</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">No pagues comida inflada para cubrir los costos de la plataforma. La IA negocia tu tarifa de envío para que siempre sea justa.</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Precios de menú reales</li>
              <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Tarifas dinámicas con IA</li>
              <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Protección anti-fraude</li>
            </ul>
          </AnimatedCard>
          <AnimatedCard delay={200}>
            <div className="text-4xl mb-4">🛵</div>
            <h3 className="text-xl font-bold text-white mb-2">Para Repartidores</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">Tú haces el trabajo físico, tú te quedas el 100% de la tarifa de envío. Trabaja directo con los restaurantes y clientes.</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><span className="text-blue-400">✓</span> 100% de la tarifa de envío</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">✓</span> Pagos instantáneos</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">✓</span> Disputas seguras</li>
            </ul>
          </AnimatedCard>
        </div>
      </section>

      {/* Bento Grid - Vision */}
      <section id="arquitectura" className="max-w-6xl mx-auto px-6 py-24 md:py-32 z-10 relative">
        <div className="text-center mb-16">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">Visión</p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Por qué existe NODO</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatedCard className="md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-2xl font-medium tracking-tight mb-2 text-white">El paradigma roto.</h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Las plataformas extractivas cobran tarifas predatorias a los restaurantes (hasta 30%) y pagan el mínimo posible a los repartidores. Un modelo ineficiente sostenido por el monopolio.
            </p>
            <div className="mt-12 flex items-end gap-4">
              <div className="w-16 h-32 bg-red-500/20 rounded-t-xl border-t border-red-500/50 relative"><span className="absolute -top-6 left-1 text-xs text-red-400">-30%</span></div>
              <div className="w-16 h-24 bg-zinc-800/50 rounded-t-xl border-t border-zinc-700"></div>
              <div className="w-16 h-48 bg-zinc-800/50 rounded-t-xl border-t border-zinc-700"></div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={100}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-6">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-medium tracking-tight mb-2 text-white">Swarm Intelligence.</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mt-8">
              Agentes Gemini evalúan tráfico y clima para calcular una tarifa justa e imparcial en 400ms. Sin humanos decidiendo cuánto cobrar.
            </p>
          </AnimatedCard>

          <AnimatedCard className="md:col-span-3 flex flex-col md:flex-row items-center gap-12" delay={200}>
            <div className="flex-1 z-10">
              <h3 className="text-3xl font-medium tracking-tight mb-4 text-white">Liquidación atómica.</h3>
              <p className="text-zinc-400 text-base leading-relaxed max-w-lg">
                Sin intermediarios tocando el dinero. El cliente deposita fondos en un smart contract <span className="text-emerald-400">on-chain</span>. Al entregar, se libera el 100% al restaurante y repartidor al instante. Comisión NODO: <strong className="text-emerald-400 text-xl">0%</strong>.
              </p>
            </div>
            <div className="flex-1 w-full relative h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border border-emerald-500/30 rounded-full animate-ping opacity-20"></div>
                <div className="w-48 h-48 border border-emerald-500/20 rounded-full absolute animate-[spin_10s_linear_infinite]"></div>
                <div className="w-16 h-16 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] z-10">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-6 py-24 md:py-32 z-10 relative text-center">
        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] rounded-[40px] p-12 md:p-16">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
            El futuro del delivery<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">no necesita intermediarios.</span>
          </h2>
          <p className="text-zinc-400 text-base max-w-lg mx-auto mb-10">
            Prueba el protocolo NODO. Pide comida, observa cómo la IA negocia tu tarifa, y mira cómo el smart contract protege tu dinero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth" className="flex items-center justify-center h-14 px-10 rounded-full bg-white text-black font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-[0_0_60px_rgba(255,255,255,0.15)]">
              Empezar ahora
            </Link>
            <a href="https://github.com/diegoc1005/p2p-delivery-mvp" target="_blank" className="flex items-center justify-center h-14 px-10 rounded-full bg-white/[0.05] border border-white/[0.1] text-white font-bold text-base hover:bg-white/[0.1] transition-all gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-12 text-center text-zinc-600 text-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="NODO" className="w-5 h-5 rounded object-cover" />
            <span className="font-semibold text-zinc-400">NODO Protocol</span>
          </div>
          <p>Diseñado con estándares AAA para GOYA Hack 2026.</p>
          <div className="flex gap-4">
            <Link href="/auth" className="text-zinc-500 hover:text-white transition-colors">Login</Link>
            <Link href="/customer" className="text-zinc-500 hover:text-white transition-colors">App</Link>
            <Link href="/vendor" className="text-zinc-500 hover:text-white transition-colors">Vendor</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
