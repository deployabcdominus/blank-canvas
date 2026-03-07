import brandLogo from "@/assets/brand-logo.png";

type LogoSize = "sm" | "md" | "lg" | number;

interface BrandLogoProps {
  size?: LogoSize;
  showText?: boolean;
  variant?: "icon" | "iconWithText";
  className?: string;
  textClassName?: string;
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
}: BrandLogoProps) => {
  const px = typeof size === "number" ? size : sizeMap[size];
  const displayText = variant === "iconWithText" || showText;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={brandLogo}
        alt="Sign Flow logo"
        className="object-contain flex-shrink-0"
        style={{ width: px, height: px }}
        draggable={false}
      />
      {displayText && (
        <span className={`font-semibold tracking-tight ${textClassName}`}>
          Sign Flow
        </span>
      )}
    </div>
  );
};
