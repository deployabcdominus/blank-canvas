import React from "react";
import { Zap, Layout, Scissors, PenTool, Move, Maximize, Box, Square, Layers, MousePointer2 } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "outline" | "solid" | "technical" | "minimal";
}

/**
 * SignFlow Logo Options
 * Focused on "Workshop/Fabrication" aesthetic:
 * - Geometric precision
 * - Cut lines / Vector paths
 * - High contrast (Black/White or Single Accent)
 * - No gradients
 */
export const SignFlowLogo = ({ className = "w-10 h-10", variant = "technical" }: LogoProps) => {
  switch (variant) {
    case "technical":
      // Option 1: "The Cut" - Symbolizing vector paths and precision fabrication
      return (
        <div className={`relative flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 border-2 border-current opacity-20 rounded-sm" />
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
          <Layers className="w-1/2 h-1/2 text-current" strokeWidth={2.5} />
        </div>
      );

    case "outline":
      // Option 2: "The Blueprint" - Simplified workshop stencil style
      return (
        <div className={`flex items-center justify-center border-2 border-current rounded-lg ${className}`}>
          <Zap className="w-3/5 h-3/5 text-primary" fill="currentColor" strokeWidth={1} />
        </div>
      );

    case "minimal":
      // Option 3: "The Node" - Representing vector points and sign assembly
      return (
        <div className={`relative ${className}`}>
          <div className="absolute inset-0 flex items-center justify-center">
             <Square className="w-full h-full text-current opacity-10" />
          </div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="font-black text-xl tracking-tighter italic">SF</span>
          </div>
        </div>
      );

    case "solid":
    default:
      // Option 4: "The Stencil" - Solid, bold, easily reproducible
      return (
        <div className={`bg-current flex items-center justify-center rounded-md ${className}`}>
          <PenTool className="w-1/2 h-1/2 text-background" strokeWidth={3} />
        </div>
      );
  }
};

export const LogoShowcase = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 glass-card">
      <div className="flex flex-col items-center gap-4">
        <SignFlowLogo variant="technical" className="w-16 h-16 text-white" />
        <span className="text-xs font-mono opacity-60">TECHNICAL / CUT</span>
      </div>
      <div className="flex flex-col items-center gap-4">
        <SignFlowLogo variant="outline" className="w-16 h-16 text-white" />
        <span className="text-xs font-mono opacity-60">BLUEPRINT</span>
      </div>
      <div className="flex flex-col items-center gap-4">
        <SignFlowLogo variant="minimal" className="w-16 h-16 text-white" />
        <span className="text-xs font-mono opacity-60">MINIMAL NODE</span>
      </div>
      <div className="flex flex-col items-center gap-4">
        <SignFlowLogo variant="solid" className="w-16 h-16 text-white" />
        <span className="text-xs font-mono opacity-60">STENCIL SOLID</span>
      </div>
    </div>
  );
};
