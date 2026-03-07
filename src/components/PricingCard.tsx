import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  plan: string;
  price: string;
  features: string[];
  glowColor: "mint" | "blue" | "lavender" | "pink";
  delay?: number;
  onSelect: (plan: string) => void;
}

const glowClasses = {
  mint: "hover:glow-mint border-mint",
  blue: "hover:glow-blue border-soft-blue",
  lavender: "hover:glow-lavender border-lavender",
  pink: "hover:glow-pink border-pale-pink",
};

export const PricingCard = ({ plan, price, features, glowColor, delay = 0, onSelect }: PricingCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`glass-card p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-all duration-300 ${glowClasses[glowColor]}`}
      whileHover={{ scale: 1.02 }}
      role="article"
      aria-labelledby={`plan-${plan.toLowerCase()}`}
    >
      <div className="text-center mb-4 sm:mb-6">
        <h3 id={`plan-${plan.toLowerCase()}`} className="text-xl sm:text-2xl font-semibold mb-2">
          {plan}
        </h3>
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          {price}
        </div>
      </div>
      
      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8" role="list">
        {features.map((feature, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1 + index * 0.1 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-mint-foreground flex-shrink-0" aria-hidden="true" />
            <span className="text-sm sm:text-base text-muted-foreground">{feature}</span>
          </motion.li>
        ))}
      </ul>
      
      <Button 
        onClick={() => onSelect(plan)}
        className="w-full btn-glass min-h-[44px] text-sm sm:text-base"
        variant="outline"
        aria-label={`Seleccionar plan ${plan}`}
      >
        Seleccionar Plan →
      </Button>
    </motion.div>
  );
};
