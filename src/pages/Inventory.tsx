import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Inventory() {
  return (
    <PageTransition>
      <ResponsiveLayout title="Inventario y Materiales" subtitle="Control de stock y suministros del taller">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 glass-card border-white/10" placeholder="Buscar materiales, vinilos, sustratos..." />
          </div>
          <Button className="btn-glass bg-primary/20 text-primary hover:bg-primary/30">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Ítem
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Total Ítems" value="124" icon={Package} color="text-violet-400" />
            <StatCard label="Stock Bajo" value="8" icon={ArrowDownRight} color="text-red-400" />
            <StatCard label="Movimientos (Mes)" value="+45" icon={ArrowUpRight} color="text-emerald-400" />
        </div>

        <Card className="glass-card border-white/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Stock Actual</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <Package className="w-12 h-12 mb-4" />
              <p>Módulo de Inventario en preparación...</p>
            </div>
          </CardContent>
        </Card>
      </ResponsiveLayout>
    </PageTransition>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="glass-card border-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </Card>
  );
}
