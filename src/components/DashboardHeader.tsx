import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";

export const DashboardHeader = () => {
  const { t } = useLanguage();
  const { fullName } = useUserProfile();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h1 className="font-bold text-2xl">{t.dashboard.welcomeBack}, {fullName.split(" ")[0]}!</h1>
      <p className="text-muted-foreground text-sm">
        {t.dashboard.projectsToday}
      </p>
    </motion.div>
  );
};
