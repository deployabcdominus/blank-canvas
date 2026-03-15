import brandLogo from "@/assets/brand-logo.png";

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

export const BrandLogo = ({
  size = "md",
  showText = false,
  variant = "icon",
  className = "",
  textClassName = "",
  showGlow = true,
}: BrandLogoProps) => {
  const px = typeof size === "number" ? size : sizeMap[size];
  const displayText = variant === "iconWithText" || showText;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full blur-lg opacity-40"
            style={{
              background: "radial-gradient(circle, hsl(25 95% 53% / 0.5), transparent 70%)",
              transform: "scale(1.8)",
            }}
          />
        )}
        <img
          src={brandLogo}
          alt="Sign Flow logo"
          className="object-contain flex-shrink-0 relative z-10"
          style={{ width: px, height: px }}
          draggable={false}
        />
      </div>
      {displayText && (
        <span className={`font-semibold tracking-tight ${textClassName}`}>
          Sign Flow
        </span>
      )}
    </div>
  );
};
