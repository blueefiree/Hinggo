import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  icon,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5 font-bold",
  };

  const variantClasses = {
    primary:
      "bg-[#FFC629] text-[#1A1A1A] hover:bg-[#FFC420] shadow-xs hover:shadow-sm border border-transparent",
    secondary:
      "bg-white text-[#1A1A1A] border border-[#EBEBEB] hover:bg-[#F6F6F4] shadow-xs",
    dark:
      "bg-[#1A1A1A] text-white hover:bg-neutral-800 shadow-xs",
    ghost:
      "bg-transparent text-[#1A1A1A] hover:bg-[#F6F6F4]",
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
