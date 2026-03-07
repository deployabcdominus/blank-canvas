import { motion } from "framer-motion";

export const DashboardHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h1 className="font-bold text-2xl">¡Bienvenido de vuelta!</h1>
      <p className="text-muted-foreground text-sm">
        Mira lo que está pasando con tus proyectos hoy.
      </p>
    </motion.div>
  );
};
