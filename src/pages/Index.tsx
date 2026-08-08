import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { SignFlowLogo, LogoShowcase } from "@/components/SignFlowLogo";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight, Check, LogIn, Zap, Target, FileText, Building,
  TrendingUp, Star, Sparkles, ChevronRight, Factory, Shield,
  CheckCircle2, CircleDot, BadgeCheck, Camera, Monitor,
  Thermometer, Signpost, Wrench, PenTool,
  WifiOff, ChevronDown, Twitter, Instagram, Linkedin,
  ThumbsUp, ThumbsDown, MapPin, Users, Activity, BarChart3, ClipboardCheck
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  PieChart, Pie, Cell 
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";

/* ─── Shimmer overlay for premium hover ─── */
const ShimmerOverlay = () => (
  <div className="absolute inset-0 -z-0 overflow-hidden rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-sweep 2s ease-in-out infinite",
      }}
    />
  </div>
);

/* ─── Scroll-reveal wrapper ─── */
const Reveal = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Animated price ─── */
const AnimatedPrice = ({ value }: { value: number }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="text-5xl font-extrabold inline-block tracking-tight"
    >
      ${value}
    </motion.span>
  </AnimatePresence>
);

/* ─── Section Badge (Violet) ─── */
const SectionBadge = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-400/70 mb-6 px-3.5 py-1.5 rounded-full border border-purple-500/15 bg-purple-500/[0.06]">
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>
);

/* ─── Trust Stars ─── */
const TrustStars = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center gap-3 mb-10">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-violet-500 text-violet-500" />
        ))}
      </div>
      <p className="text-[12px] font-medium text-zinc-500 tracking-wide uppercase">
        {t.landing.hero.trust}
      </p>
    </div>
  );
};

/* ─── CountUpValue component ─── */
const CountUpValue = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const stepTime = Math.abs(Math.floor(duration / end));
      
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return <span ref={ref}>{count}</span>;
};

/* ═══════════════════════════════════════════════════════ */
/*     MACBOOK PRO MOCKUP (HERO)                           */
/* ═══════════════════════════════════════════════════════ */
const MacBookMockup = () => {
  const { t } = useLanguage();
  const m = t.landing.mockup;
  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ perspective: "100rem" }}>
      <div className="absolute -inset-[10vw] sm:-inset-40 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(168,85,247,0.15),transparent_60%)] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 70, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 4 }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div
          className="relative rounded-t-[1.5rem] sm:rounded-t-[2rem] bg-zinc-950 overflow-hidden"
          style={{
            aspectRatio: "16/9",
            height: "auto",
            minHeight: "220px"
          }}
        >
            <div className="absolute inset-0">
              <div className="h-full w-full grid grid-rows-[auto_1fr] md:gap-4 gap-2 p-2 md:p-4 overflow-hidden bg-zinc-950">
                {/* Desktop Header Content (hidden on small mobile) */}
                <div className="hidden md:grid grid-cols-[160px_1fr] gap-4 h-full min-h-0">
                  <div className="flex flex-col bg-white/[0.015] rounded-lg border border-white/[0.04] p-3 gap-2">
                    <div className="flex items-center gap-2 mb-2">
                      <SignFlowLogo variant="technical" className="w-5 h-5 text-violet-500" />
                      <span className="text-[10px] font-bold text-zinc-300">SignFlow</span>
                    </div>
                    {["Dashboard", "Orders", "Specialists", "Accounts"].map((item) => (
                      <div key={item} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[8px] font-medium text-zinc-600 hover:bg-white/[0.05] cursor-default">
                         <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                         {item}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 min-h-0">
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-3 flex flex-col justify-between">
                      <div>
                        <p className="text-[7px] text-zinc-600 uppercase tracking-wider font-medium">Monthly Revenue</p>
                        <p className="text-xl font-bold text-white/85">$184K</p>
                      </div>
                      <div className="h-8 mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[{v:10},{v:15},{v:12},{v:20},{v:18},{v:25},{v:30}]}>
                            <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {[
                      { label: "Active Orders", value: 42, color: "text-violet-400" },
                      { label: "Operators", value: 18, color: "text-emerald-400" },
                      { label: "Critical SLA", value: 3, color: "text-orange-400" },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-3">
                        <p className="text-[7px] text-zinc-600 uppercase tracking-wider font-medium">{kpi.label}</p>
                        <p className="text-xl font-bold text-white/85 mt-1">{kpi.value}</p>
                        <p className={`text-[7px] font-semibold mt-1 ${kpi.color}`}>+12%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Header (simplified KPI cards) */}
                <div className="md:hidden grid grid-cols-3 gap-2">
                  {[
                    { label: "Rev", value: "$184K", color: "text-violet-400" },
                    { label: "Orders", value: 42, color: "text-emerald-400" },
                    { label: "Alerts", value: 3, color: "text-orange-400" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2">
                      <p className="text-[6px] text-zinc-600 uppercase font-medium truncate">{kpi.label}</p>
                      <p className="text-xs font-bold text-white/85 mt-0.5">{kpi.value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Main Content Area */}
                <div className="grid md:grid-cols-[1fr_240px] grid-cols-1 md:gap-4 gap-2 min-h-0 overflow-hidden">
                  {/* Left Column: Work Orders */}
                  <div className="bg-white/[0.01] rounded-lg border border-white/[0.04] p-3 flex flex-col min-h-0 relative">
                    <div className="absolute top-3 right-3 w-8 h-8 md:w-10 md:h-10">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={[{v:50},{v:30},{v:20}]} dataKey="v" stroke="none" innerRadius={8} outerRadius={15}>
                              <Cell fill="#3b82f6" /><Cell fill="#10b981" /><Cell fill="#f97316" />
                           </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                    </div>
                    <span className="text-[7px] md:text-[8px] text-zinc-500 font-semibold uppercase mb-2">Work Orders</span>
                    <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1 custom-scrollbar">
                       {[
                         { id: "#ORD-4201", client: "Delta Corp", status: "Production", color: "bg-blue-400" },
                         { id: "#ORD-4202", client: "Skyline Ltd", status: "Installation", color: "bg-emerald-400" },
                         { id: "#ORD-4203", client: "Urban Signs", status: "Review", color: "bg-orange-400" },
                         { id: "#ORD-4204", client: "Vega Realty", status: "Installation", color: "bg-emerald-400" },
                         { id: "#ORD-4205", client: "Coastal Group", status: "Production", color: "bg-blue-400" },
                       ].map(order => (
                         <div key={order.id} className="flex items-center gap-2 p-1 md:p-1.5 rounded bg-white/[0.02] border border-white/[0.03]">
                           <div className={`w-1 h-2 md:h-3 rounded-full ${order.color}`} />
                           <span className="text-[6px] md:text-[7px] font-bold text-zinc-300 truncate flex-1">{order.client}</span>
                           <span className="text-[5px] md:text-[6px] text-zinc-500 uppercase">{order.status}</span>
                         </div>
                       ))}
                    </div>
                    {/* Weekly chart (Desktop only or wider mobile) */}
                    <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/[0.04] hidden xs:block">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[6px] md:text-[7px] text-zinc-500 font-bold uppercase">Weekly Trend</span>
                        <span className="text-[6px] md:text-[7px] text-violet-400 font-bold">+14%</span>
                      </div>
                      <div className="h-6 md:h-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{v:40},{v:60},{v:45},{v:80},{v:55}]}>
                            <Bar dataKey="v" fill="#8b5cf6" radius={[2, 2, 0, 0]} opacity={0.6} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column: Specialists / Activity */}
                  <div className="bg-white/[0.01] rounded-lg border border-white/[0.04] p-3 flex flex-col min-h-0 overflow-hidden">
                    <span className="text-[7px] md:text-[8px] text-zinc-500 font-semibold uppercase mb-2 tracking-wider">Active Specialists</span>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0 custom-scrollbar">
                      {[
                        { n: "C. López", s: "En Route", c: "bg-emerald-400" },
                        { n: "M. García", s: "On Site", c: "bg-violet-400" },
                        { n: "R. Torres", s: "Alert", c: "bg-orange-400" },
                        { n: "A. Méndez", s: "Free", c: "bg-zinc-500" },
                      ].map((tech: any, i) => (
                        <div key={i} className="flex items-center gap-2 px-1.5 py-1 rounded bg-white/[0.02] border border-white/[0.03]">
                          <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${tech.c}`} />
                          <span className="text-[6px] md:text-[7px] text-zinc-400 font-medium truncate flex-1">{tech.n}</span>
                          <span className="text-[5px] md:text-[6px] text-zinc-600">{tech.s}</span>
                        </div>
                      ))}
                    </div>
                    {/* Live Feed (Desktop/Large Mobile only) */}
                    <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/[0.04] hidden sm:block">
                      <span className="text-[6px] md:text-[7px] text-zinc-500 font-semibold uppercase mb-1 block">Live Feed</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-emerald-400" />
                          <span className="text-[5px] md:text-[6px] text-zinc-600 truncate">López @ Delta Corp</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-violet-400" />
                          <span className="text-[5px] md:text-[6px] text-zinc-600 truncate">Torres Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-[1px] left-1/2 -translate-x-1/2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-zinc-800 border border-zinc-700/30 z-10" />
        </div>
        <div className="relative">
          <div className="w-[103%] -ml-[1.5%] h-[10px] bg-gradient-to-b from-zinc-700/40 to-zinc-800/60 rounded-b-[4px]" />
          <div className="w-[70%] mx-auto h-[4px] bg-zinc-700/20 rounded-b-xl" />
        </div>
      </motion.div>
      <div
        className="w-[85%] mx-auto h-20 mt-2 opacity-20"
        style={{
          background: "linear-gradient(to bottom, rgba(168,85,247,0.12), transparent 80%)",
          filter: "blur(12px)",
          transform: "scaleY(-0.5)",
        }}
      />
    </div>
  );
};
... rest of the file ...
