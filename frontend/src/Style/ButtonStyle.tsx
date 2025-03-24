import { cva, type VariantProps } from "class-variance-authority";

const buttonStyle = cva(
  "transition-all duration-300", // Classes de base
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        white: "bg-white text-blue-500 hover:bg-gray-200",
        dark: "bg-black text-white hover:bg-gray-800",
      },
      width: {
        full: "w-full",
        auto: "w-auto",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      font: {
        normal: "font-normal",
        bold: "font-bold",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
      borderColor: {
        none: "border-none",
        default: "border border-blue-500",
        white: "border border-white",
        dark: "border border-black",
      },
    },
    defaultVariants: {
      variant: "default",
      width: "auto",
      size: "md",
      font: "normal",
      rounded: "md",
      borderColor: "none",
    },
  }
);

export type ButtonStyleProps = VariantProps<typeof buttonStyle>;
export default buttonStyle;
