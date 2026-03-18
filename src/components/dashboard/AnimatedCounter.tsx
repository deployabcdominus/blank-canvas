import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export const AnimatedCounter = ({ value, className = "" }: AnimatedCounterProps) => {
  const [showPulse, setShowPulse] = useState(false);
  const prevValue = useRef(value);
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [rendered, setRendered] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setRendered(v));
    return unsub;
  }, [display]);

  // Pulse when value changes (not on first render)
  useEffect(() => {
    if (prevValue.current !== value && prevValue.current !== undefined) {
      setShowPulse(true);
      const t = setTimeout(() => setShowPulse(false), 600);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <motion.span
      className={className}
      animate={showPulse ? {
        scale: [1, 1.15, 1],
        color: ["hsl(var(--foreground))", "hsl(var(--primary))", "hsl(var(--foreground))"],
      } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {rendered}
    </motion.span>
  );
};
