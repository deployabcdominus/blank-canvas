import { SignFlowLogo } from "@/components/SignFlowLogo";

type LogoSize = "sm" | "md" | "lg" | number;

interface BrandLogoProps {
  size?: LogoSize;
  showText?: boolean;
  variant?: "icon" | "iconWithText";
  className?: string;
  textClassName?: string;
  showGlow?: boolean;
}

const sizeMap: Record<string, number> = {
  sm: 28,
  md: 36,
  lg: 56,
};

/**
 * Single source of truth for the app logo.
 * Renders the technical SignFlow mark everywhere (sidebar, auth pages, landing).
 */
export const BrandLogo = ({
  size = "md",
  showText = false,
  variant = "icon",
  className = "",
  textClassName = "",
  showGlow = false,
}: BrandLogoProps) => {
  const px = typeof size === "number" ? size : sizeMap[size];
  const displayText = variant === "iconWithText" || showText;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: px, height: px }}>
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full blur-lg opacity-30"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.5), transparent 70%)",
              transform: "scale(1.6)",
            }}
          />
        )}
        <SignFlowLogo variant="technical" className="relative z-10 w-full h-full text-foreground" />
      </div>
      {displayText && (
        <span className={`font-semibold tracking-tight ${textClassName}`}>
          Sign Flow
        </span>
      )}
    </div>
  );
};
