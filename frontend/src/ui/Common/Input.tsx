import React from "react";
import { inputVariants } from "../../Style/InputButton";

import { cn } from "../../lib/utils";

interface InputProps {
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: boolean;
}
export const Input = ({ type, name, value, onChange, placeholder, error }: InputProps) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(inputVariants({ variant: error ? "error" : "primary" }))}
    />
  );
};
