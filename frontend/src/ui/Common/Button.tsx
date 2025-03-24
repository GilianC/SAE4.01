import React from "react";
import buttonStyle, { ButtonStyleProps } from "../../Style/ButtonStyle";

interface ButtonProps extends ButtonStyleProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  type?: "button" | "submit";
}

export default function Button({
  onClick,
  children,
  type = "button",
  variant,
  width,
  size,
  font,
  rounded,
  borderColor, // Ajout de la prop
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonStyle({ variant, width, size, font, rounded, borderColor })} // Application des styles
    >
      {children}
    </button>
  );
}
