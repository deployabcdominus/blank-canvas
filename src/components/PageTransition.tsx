import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "zoom" | "parallax";
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 },
  },
  parallax: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -20, scale: 1.02 },
  }
};

const defaultTransition = {
  duration: 0.4,
  ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
};

export const PageTransition = ({ children, variant = "fade" }: PageTransitionProps) => {
  const location = useLocation();
  
  const activeVariant = variants[variant] || variants.fade;

  return (
    <motion.div
      key={location.key}
      initial="initial"
      animate="in"
      exit="out"
      variants={activeVariant}
      transition={defaultTransition}
      className="min-h-screen will-change-transform transform-gpu"
    >
      {children}
    </motion.div>
  );
};
