import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type TransitionEffect = 
  | "fade" 
  | "slide-left" 
  | "slide-right" 
  | "slide-up" 
  | "slide-down" 
  | "zoom-in" 
  | "zoom-out" 
  | "flip-h" 
  | "flip-v" 
  | "parallax";

interface PageTransitionProps {
  children: ReactNode;
  effect?: TransitionEffect;
  duration?: number;
  easing?: number[] | string;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  },
  "slide-left": {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  },
  "slide-right": {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 50 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -50 },
  },
  "slide-down": {
    initial: { opacity: 0, y: -50 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: 50 },
  },
  "zoom-in": {
    initial: { opacity: 0, scale: 0.9 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.1 },
  },
  "zoom-out": {
    initial: { opacity: 0, scale: 1.1 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.9 },
  },
  "flip-h": {
    initial: { opacity: 0, rotateY: 90 },
    in: { opacity: 1, rotateY: 0 },
    out: { opacity: 0, rotateY: -90 },
  },
  "flip-v": {
    initial: { opacity: 0, rotateX: 90 },
    in: { opacity: 1, rotateX: 0 },
    out: { opacity: 0, rotateX: -90 },
  },
  parallax: {
    initial: { opacity: 0, y: 100, scale: 0.95 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -100, scale: 1.05 },
  },
};

export const PageTransition = ({ 
  children, 
  effect = "fade",
  duration = 0.4,
  easing = [0.23, 1, 0.32, 1]
}: PageTransitionProps) => {
  const location = useLocation();
  const activeVariant = variants[effect] || variants.fade;

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={activeVariant}
      transition={{
        duration,
        ease: easing as any,
      }}
      className="w-full min-h-screen relative overflow-hidden"
      style={{ backfaceVisibility: "hidden", perspective: "1200px" }}
    >
      {children}
    </motion.div>
  );
};
