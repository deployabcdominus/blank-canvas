import React from "react";
import { Link } from "react-router-dom";
import { SignFlowLogo } from "./SignFlowLogo";

export const BrandLogo = ({ 
  size = 32, 
  showText = true, 
  className = "", 
  variant = "iconWithText",
  textClassName = ""
}: { 
  size?: number; 
  showText?: boolean; 
  className?: string; 
  variant?: "iconOnly" | "textOnly" | "iconWithText";
  textClassName?: string;
}) => {
  return (
    <Link to="/" className={`flex items-center gap-2 hover:opacity-90 transition-opacity ${className}`}>
      <SignFlowLogo size={size} variant={variant === "textOnly" ? "minimal" : "technical"} />
      {showText && variant !== "iconOnly" && (
        <span className={`font-bold tracking-tight text-white ${textClassName}`}>
          SignFlow
        </span>
      )}
    </Link>
  );
};
