
import React, { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export type TransitionType = 
  | "fade" 
  | "slide-left" 
  | "slide-right" 
  | "slide-up" 
  | "slide-down" 
  | "zoom" 
  | "flip-x" 
  | "flip-y"
  | "parallax";

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  easing?: number[] | string;
  className?: string;
}

const variants: Record<TransitionType, any> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "slide-left": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "slide-right": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  "slide-up": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "slide-down": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
  "flip-x": {
    initial: { rotateX: 90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: -90, opacity: 0 },
  },
  "flip-y": {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
  parallax: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  }
};

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  type = "fade", 
  duration = 0.4, 
  easing = [0.22, 1, 0.36, 1], // Custom cubic-bezier for smooth motion
  className = "" 
}) => {
  const selectedVariant = variants[type];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={selectedVariant}
      transition={{
        duration,
        ease: easing,
      }}
      className={`w-full min-h-screen ${className}`}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
};
