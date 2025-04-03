import { cva } from "class-variance-authority";

const buttonStyle = cva(
  "w-full py-2 px-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2",
  {
    variants: {
      variant: {
        primary: "bg-blue-800 text-white hover:bg-blue-700 focus:ring-blue-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
        white: "bg-white text-gray-800 hover:bg-gray-100 focus:ring-gray-300",
      },
      width: {
        small: "w-1/2",
        medium: "w-1/3",
        auto: "w-auto",
        full: "w-full",
      },
      size: {
        md: "py-2 px-4 text-md",
        sm: "py-1 px-2 text-sm",
        lg: "py-3 px-6 text-lg",
      },
      font: {
        normal: "font-normal",

      },
      rounded: {
        full: "rounded-full",
        lg: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      width: "full",
      size: "md",
      font: "normal",
      rounded: "lg",
    },
  }
);


export default buttonStyle;
