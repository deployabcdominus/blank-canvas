import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { 
  ArrowRight, 
  Play, 
  Target, 
  Crown, 
  Star,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu
} from "lucide-react";

// --- MOCK BRANDS ---
const CLIENTS = [
  { name: "Acme Corp", icon: Hexagon },
  { name: "Quantum", icon: Triangle },
  { name: "Command+Z", icon: Command },
  { name: "Phantom", icon: Ghost },
  { name: "Ruby", icon: Gem },
  { name: "Chipset", icon: Cpu },
];

// --- SUB-COMPONENTS ---
const StatItem = ({ value, label, showBorder = true }: { value: string; label: string; showBorder?: boolean }) => (
  <div className={`flex flex-col ${showBorder ? 'border-r border-white/10 pr-6 mr-6' : ''}`}>
    <span className="text-lg font-black text-white tracking-tight">{value}</span>
    <span className="text-[8px] text-white/30 uppercase font-black tracking-[0.2em] leading-none mt-1.5 whitespace-nowrap">{label}</span>
  </div>
);

// --- MAIN COMPONENT ---
export default function HeroSection() {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const L = t.landing.hero;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full min-h-[85vh] lg:min-h-[100vh] flex flex-col items-center justify-center overflow-visible bg-black pt-32 pb-24 z-10">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Background Image with Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-10" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80')] bg-cover bg-center" />
      </div>

      <div className="relative z-20 w-full max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col space-y-8 text-center lg:text-left items-center lg:items-start animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex -space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-black bg-zinc-800 flex items-center justify-center">
                    <Star size={10} className="text-violet-400 fill-violet-400" />
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">{L.badge}</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white leading-[0.95] lg:leading-[0.9]">
              {L.titleLine1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {L.titleLine2}
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-xl text-lg md:text-xl text-white/50 leading-relaxed font-medium">
              {L.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
              <button 
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold rounded-2xl flex items-center justify-center hover:bg-zinc-200 transition-all group shadow-xl shadow-white/5"
              >
                {L.ctaPrimary}
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => scrollTo("industries")}
                className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-md"
              >
                <Play size={18} className="mr-2 fill-white" />
                {L.ctaSecondary}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative animate-fade-in delay-200 hidden lg:block">
            {/* Stats Card */}
            <div className="relative group overflow-visible rounded-[2.5rem] border border-white/10 bg-zinc-900/40 p-10 backdrop-blur-2xl transition-all hover:border-white/20">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px] transition-all group-hover:bg-violet-500/20" />

              <div className="relative z-10 flex flex-col space-y-10">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-violet-500/20 blur-sm animate-pulse" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/30 border border-white/20">
                      <Target className="text-white" size={32} />
                    </div>
                  </div>

                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-[0.3em] text-violet-400 uppercase">
                    Award-winning design
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-6xl font-black text-white tracking-tighter">
                    {locale === 'es' ? '500+' : '500+'}
                  </div>
                  <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">
                    {locale === 'es' ? 'Empresas Activas' : 'Active Businesses'}
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="text-white/40">{locale === 'es' ? 'Satisfacción Cliente' : 'Client Satisfaction'}</span>
                    <span className="text-violet-400">99.9%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 p-[1px]">
                    <div className="h-full w-[99.9%] rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-[length:200%_100%] animate-shimmer" />
                  </div>
                </div>

                {/* Mini Stats Grid - Separated by lines */}
                <div className="flex items-center py-2">
                  <StatItem value="5min" label={locale === 'es' ? 'Setup' : 'Setup'} />
                  <StatItem value="24/7" label={locale === 'es' ? 'Soporte' : 'Support'} />
                  <StatItem value="99.9%" label={locale === 'es' ? 'Uptime' : 'Uptime'} showBorder={false} />
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center space-x-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-violet-400">
                    <div className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
                    </div>
                    <span>ACTIVE</span>
                  </div>

                  <div className="flex items-center space-x-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-fuchsia-400 uppercase">
                    <Crown size={12} />
                    <span>PREMIUM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee Card */}
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
              <div className="mb-6 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                {t.landing.trusted}
              </div>
              
              <div className="relative w-full overflow-hidden">
                <div className="flex w-max items-center space-x-16 animate-marquee">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div key={i} className="flex items-center space-x-4 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
                      <client.icon size={22} className="text-white group-hover:text-violet-500 transition-colors" />
                      <span className="text-sm font-bold tracking-widest text-white uppercase">
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
