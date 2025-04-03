import React from "react";
import  buttonStyle  from "../../Style/ButtonStyle";
import { cn } from "../../lib/utils";

interface ButtonProps {
  type: "button" | "submit";
  children: React.ReactNode;
  variant?: "primary" | "danger" | "secondary" | "white";
  width?: "auto" | "full" | "small" | "medium";
  size?: "md" | "sm" | "lg";
  font?: "normal";
  rounded?: "full" | "lg";
  onClick?: () => void;
}

export const Button = ({
  type,
  children,
  variant = "primary",
  width = "full",
  size = "md",
  font = "normal",
  rounded = "lg",
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(buttonStyle({ variant, width, size, font, rounded }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
};


