import React from "react";
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

const CLIENTS = [
  { name: "Acme Corp", icon: Hexagon },
  { name: "Quantum", icon: Triangle },
  { name: "Command+Z", icon: Command },
  { name: "Phantom", icon: Ghost },
  { name: "Ruby", icon: Gem },
  { name: "Chipset", icon: Cpu },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col">
    <span className="text-xl font-bold text-white">{value}</span>
    <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
  </div>
);

export default function HeroSection() {
  return (
    <div className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-black pt-20 pb-10">
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
      `}</style>

      {/* Background with Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80')] bg-cover bg-center" />
      </div>

      <div className="relative z-20 w-full max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col space-y-8 text-center lg:text-left items-center lg:items-start animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex -space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-black bg-zinc-800 flex items-center justify-center">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  </div>
                ))}
              </div>
              <span className="text-xs font-medium text-white/80">Award-Winning Design</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Crafting Digital<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Experiences
              </span><br />
              That Matter
            </h1>

            {/* Description */}
            <p className="max-w-xl text-lg text-white/60 leading-relaxed">
              We design interfaces that combine beauty with functionality,
              creating seamless experiences that users love and businesses thrive on.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-2xl flex items-center justify-center hover:bg-white/90 transition-all group">
                View Portfolio
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-sm">
                <Play size={16} className="mr-2 fill-white" />
                Watch Showreel
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="relative animate-fade-in delay-200">
            {/* Stats Card */}
            <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl transition-all hover:border-white/20">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px] transition-all group-hover:bg-violet-500/30" />

              <div className="relative z-10 flex flex-col space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
                    <Target className="text-white" size={28} />
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-bold text-white tracking-tight">150+</div>
                    <div className="text-xs font-medium text-white/40 uppercase tracking-[0.2em]">Projects Delivered</div>
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Client Satisfaction</span>
                    <span className="font-semibold text-white">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[98%] bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/10" />

                {/* Mini Stats Grid */}
                <div className="grid grid-cols-3 gap-6">
                  <StatItem value="24/7" label="Support" />
                  <StatItem value="12" label="Countries" />
                  <StatItem value="5.0" label="Rating" />
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <div className="flex items-center space-x-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-green-400">
                    <div className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </div>
                    <span>ACTIVE</span>
                  </div>

                  <div className="flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-wider text-white/50">
                    <Crown size={12} className="text-yellow-500/50" />
                    <span>PREMIUM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee Card */}
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                Trusted by Industry Leaders
              </div>
              
              <div className="relative w-full overflow-hidden">
                <div className="flex w-max items-center space-x-12 animate-marquee">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div key={i} className="flex items-center space-x-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default group">
                      <client.icon size={20} className="text-white group-hover:text-violet-400 transition-colors" />
                      <span className="text-sm font-semibold tracking-wide text-white">
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
