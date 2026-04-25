import { motion } from "framer-motion";
import { 
  Globe, 
  UserCheck, 
  MapPin, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Wifi, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  Languages,
  Award,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold tracking-tight text-slate-800">GlobalPath</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#perfil" className="hover:text-indigo-600 transition-colors">Perfil</a>
              <a href="#destinos" className="hover:text-indigo-600 transition-colors">Destinos</a>
              <a href="#vistos" className="hover:text-indigo-600 transition-colors">Vistos</a>
              <a href="#roadmap" className="hover:text-indigo-600 transition-colors">Cronograma</a>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
              Agendar Consultoria
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 border-indigo-200 text-indigo-700 bg-indigo-50 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Planejamento de Carreira Internacional
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
                Seu futuro não tem <span className="text-indigo-600">fronteiras.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Consultoria especializada em imigração estratégica para profissionais qualificados. 
                Transformamos sua experiência profissional em uma carreira global.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-xl shadow-indigo-200 group">
                  Começar Planejamento
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-200">
                  Ver Destinos
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 1. Análise de Perfil */}
        <section id="perfil" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <SectionLabel icon={UserCheck} text="Análise de Perfil" />
                <h2 className="text-4xl font-bold text-slate-900 mb-6">O que preciso saber para traçar seu caminho</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Para identificar as melhores oportunidades de imigração, precisamos realizar uma auditoria detalhada do seu histórico. 
                  Abaixo estão os pilares fundamentais que analisaremos:
                </p>
                <div className="space-y-6">
                  <ProfileRequirement 
                    icon={GraduationCap} 
                    title="Formação Acadêmica" 
                    desc="Nível de graduação (Bacharelado, Mestrado, Doutorado) e equivalência internacional." 
                  />
                  <ProfileRequirement 
                    icon={Briefcase} 
                    title="Experiência Profissional" 
                    desc="Anos de atuação, cargos ocupados e se sua profissão está em listas de alta demanda." 
                  />
                  <ProfileRequirement 
                    icon={Languages} 
                    title="Proficiência em Idiomas" 
                    desc="Resultados em exames oficiais (IELTS, TOEFL, DELF, TestDaF) e fluência prática." 
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-500/5 blur-3xl rounded-full" />
                <Card className="relative border-slate-200 shadow-2xl overflow-hidden">
                  <CardHeader className="bg-slate-900 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      Checklist do Candidato Ideal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4">
                    {["Passaporte válido por > 2 anos", "Currículo no formato internacional (ATS-friendly)", "Comprovação de fundos financeiros", "Histórico criminal limpo", "Diplomas e históricos traduzidos"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                    <div className="pt-6">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                        Solicitar Avaliação Gratuita
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Destinos Recomendados */}
        <section id="destinos" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel icon={MapPin} text="Destinos Recomendados" />
              <h2 className="text-4xl font-bold text-slate-900">3 Países com Políticas Favoráveis em 2024</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <DestinationCard 
                country="Canadá" 
                flag="🇨🇦"
                badge="Líder em Qualificação"
                desc="Com o sistema Express Entry, o Canadá prioriza profissionais em tecnologia, saúde e construção."
                pros={["Cidadania em 3 anos", "Sistema de saúde público", "Multiculturalismo"]}
              />
              <DestinationCard 
                country="Alemanha" 
                flag="🇩🇪"
                badge="Chancenkarte"
                desc="O novo 'Cartão de Oportunidades' permite que profissionais busquem emprego localmente com mais facilidade."
                pros={["Economia mais forte da Europa", "Custo de vida equilibrado", "Visto de busca de emprego"]}
              />
              <DestinationCard 
                country="Portugal" 
                flag="🇵🇹"
                badge="Nômade Digital & Tech"
                desc="Ideal para profissionais remotos e empreendedores de tecnologia com o visto D8 e D7."
                pros={["Idioma comum (PT)", "Segurança excepcional", "Clima e qualidade de vida"]}
              />
            </div>
          </div>
        </section>

        {/* 3. Tipos de Visto */}
        <section id="vistos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <SectionLabel icon={FileText} text="Categorias de Visto" />
            <h2 className="text-4xl font-bold text-slate-900 mb-16">Caminhos Legais para sua Migração</h2>
            
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="trabalho" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-slate-100 rounded-xl mb-12">
                  <TabsTrigger value="trabalho" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Trabalho</TabsTrigger>
                  <TabsTrigger value="busca" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Busca de Emprego</TabsTrigger>
                  <TabsTrigger value="nomade" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Nômade Digital</TabsTrigger>
                  <TabsTrigger value="estudos" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Estudos</TabsTrigger>
                </TabsList>
                <div className="mt-8 text-left">
                  <TabsContent value="trabalho">
                    <VisaTypeDetail 
                      icon={Briefcase}
                      title="Visto de Trabalho (Hired)"
                      desc="Exige uma oferta de emprego formal (Job Offer) de uma empresa local. Frequentemente a empresa atua como sponsor."
                      requirements={["Contrato de trabalho assinado", "LMIA ou certificação equivalente", "Salário compatível com a média local"]}
                    />
                  </TabsContent>
                  <TabsContent value="busca">
                    <VisaTypeDetail 
                      icon={SearchIcon}
                      title="Visto de Busca de Emprego"
                      desc="Permite que você entre no país legalmente por um período determinado (geralmente 6 meses) para procurar trabalho presencialmente."
                      requirements={["Diploma reconhecido", "Seguro saúde internacional", "Fundos para subsistência mínima"]}
                    />
                  </TabsContent>
                  <TabsContent value="nomade">
                    <VisaTypeDetail 
                      icon={Wifi}
                      title="Digital Nomad Visa"
                      desc="Para profissionais que trabalham remotamente para empresas fora do país de destino. Focado em atrair consumo sem competir com o mercado local."
                      requirements={["Comprovação de renda passiva ou remota", "Contrato de prestação de serviços", "Média salarial mínima exigida"]}
                    />
                  </TabsContent>
                  <TabsContent value="estudos">
                    <VisaTypeDetail 
                      icon={GraduationCap}
                      title="Visto de Estudos & Trabalho"
                      desc="Matrícula em cursos de nível superior ou vocacionais. Muitos países permitem trabalhar meio período (20h/semana) durante o curso."
                      requirements={["Carta de aceitação da instituição (LOA)", "Comprovação de pagamento da tuition", "Nível de idioma exigido pelo curso"]}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </section>

        {/* 4. Passo a Passo / Roadmap */}
        <section id="roadmap" className="py-24 bg-slate-950 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <SectionLabel icon={Calendar} text="Cronograma Estratégico" />
              <h2 className="text-4xl font-bold mb-4">Suas Primeiras Etapas</h2>
              <p className="text-slate-400">Um planejamento seguro leva entre 6 a 18 meses.</p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-800 hidden md:block" />
              
              <div className="space-y-12">
                <TimelineStep 
                  month="Mês 1-2"
                  title="Auditoria & Idioma"
                  desc="Avaliação do perfil, escolha do destino e início intensivo de estudos do idioma para atingir o score necessário no exame oficial."
                  side="left"
                />
                <TimelineStep 
                  month="Mês 3-4"
                  title="Documentação & Validação"
                  desc="Traduções juramentadas, apostilamento de Haia e solicitação de equivalência de diplomas (ECA no Canadá, ZAB na Alemanha)."
                  side="right"
                />
                <TimelineStep 
                  month="Mês 5-6"
                  title="Reserva Financeira"
                  desc="Consolidação dos fundos (Proof of Funds). A maioria dos países exige entre €10k e $15k por aplicante principal."
                  side="left"
                />
                <TimelineStep 
                  month="Mês 7-8"
                  title="Aplicação ou Busca"
                  desc="Submissão do perfil nos sistemas de imigração ou início das candidaturas para vagas de emprego no formato local."
                  side="right"
                />
              </div>
            </div>
            
            <div className="mt-24 text-center">
              <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500">
                <div className="bg-slate-950 rounded-xl px-12 py-10">
                  <h3 className="text-2xl font-bold mb-4">Pronto para dar o primeiro passo?</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Nossa consultoria individualizada ajuda você a evitar erros caros e acelera seu processo de imigração.
                  </p>
                  <Button className="bg-white text-slate-950 hover:bg-slate-100 font-bold px-8 h-12">
                    Falar com Especialista Agora
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-600" />
              <span className="text-lg font-bold text-slate-800">GlobalPath</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 GlobalPath Consultoria Internacional. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-slate-400">
              <span className="hover:text-indigo-600 cursor-pointer">Instagram</span>
              <span className="hover:text-indigo-600 cursor-pointer">LinkedIn</span>
              <span className="hover:text-indigo-600 cursor-pointer">YouTube</span>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

// Helper Components
const SectionLabel = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
    <Icon className="w-3.5 h-3.5" />
    {text}
  </div>
);

const ProfileRequirement = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex gap-4 group">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const DestinationCard = ({ country, flag, badge, desc, pros }: { country: string; flag: string; badge: string; desc: string; pros: string[] }) => (
  <Card className="border-slate-200 hover:border-indigo-300 transition-all hover:shadow-xl hover:-translate-y-1">
    <CardHeader>
      <div className="flex justify-between items-start mb-2">
        <span className="text-4xl">{flag}</span>
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">{badge}</Badge>
      </div>
      <CardTitle className="text-2xl font-bold">{country}</CardTitle>
      <CardDescription className="text-slate-600 pt-2">{desc}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {pros.map((pro, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
          <div className="w-1 h-1 rounded-full bg-indigo-500" />
          {pro}
        </div>
      ))}
      <Button variant="ghost" className="w-full mt-4 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto font-bold justify-start group">
        Ver detalhes do processo
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Button>
    </CardContent>
  </Card>
);

const VisaTypeDetail = ({ icon: Icon, title, desc, requirements }: { icon: any; title: string; desc: string; requirements: string[] }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
  >
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
        <Icon className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-lg text-slate-600 mb-6 leading-relaxed">{desc}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {requirements.map((req, i) => (
            <div key={i} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-slate-700">{req}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const TimelineStep = ({ month, title, desc, side }: { month: string; title: string; desc: string; side: 'left' | 'right' }) => (
  <div className={`flex flex-col md:flex-row items-center justify-center gap-8 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
    <div className={`flex-1 w-full text-center ${side === 'left' ? 'md:text-right' : 'md:text-left'}`}>
      <Badge className="mb-2 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{month}</Badge>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-slate-400 max-w-sm mx-auto md:mx-0 inline-block">{desc}</p>
    </div>
    <div className="relative flex items-center justify-center z-10">
      <div className="w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
        <div className="w-3 h-3 rounded-full bg-indigo-500" />
      </div>
    </div>
    <div className="flex-1 hidden md:block" />
  </div>
);

const SearchIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

export default Index;
