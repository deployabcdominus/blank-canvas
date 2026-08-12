
import React, { useState } from "react";
import { PageTransition, TransitionType } from "../PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence } from "framer-motion";

export const TransitionShowcase = () => {
  const [transition, setTransition] = useState<TransitionType>("fade");
  const [key, setKey] = useState(0);

  const types: TransitionType[] = [
    "fade", "slide-left", "slide-right", "slide-up", "slide-down", 
    "zoom", "flip-x", "flip-y", "parallax"
  ];

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <Card className="bg-card/50 backdrop-blur-md border-primary/20 shadow-xl shadow-violet-950/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Page Transition Showcase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Effect</Label>
            <Select value={transition} onValueChange={(v) => setTransition(v as TransitionType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transition" />
              </SelectTrigger>
              <SelectContent>
                {types.map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setKey(prev => prev + 1)}
          >
            Trigger Transition
          </Button>

          <div className="relative h-64 w-full overflow-hidden rounded-xl border border-dashed border-primary/30 flex items-center justify-center bg-zinc-900/50">
            <AnimatePresence mode="wait">
              <PageTransition key={key} type={transition} className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-inner">
                  <div className="w-16 h-16 bg-violet-500 rounded-full mx-auto shadow-lg shadow-violet-500/50 animate-pulse" />
                  <h3 className="text-xl font-semibold text-white">Visualizing: {transition}</h3>
                  <p className="text-zinc-400 text-sm">Testing hardware-accelerated transitions.</p>
                </div>
              </PageTransition>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-xs text-center text-zinc-500 italic">
        * Using Framer Motion with cubic-bezier([0.22, 1, 0.36, 1]) for optimal smoothness.
      </div>
    </div>
  );
};
