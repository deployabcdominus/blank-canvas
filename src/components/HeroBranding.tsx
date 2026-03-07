import { motion } from "framer-motion";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { BrandLogo } from "@/components/BrandLogo";

export const HeroBranding = () => {
  return (
    <div className="mb-8 sm:mb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex justify-center"
      >
        <BrandLogo size={96} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
          {FIXED_BRANDING.appName}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light px-4">
          {FIXED_BRANDING.appTagline}
        </p>
      </motion.div>
    </div>
  );
};
