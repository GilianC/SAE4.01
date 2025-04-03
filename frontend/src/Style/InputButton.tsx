import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all",
  {
    variants: {
      variant: {
        primary: "bg-gray-700 text-white border-gray-600 focus:ring-blue-500",
        error: "bg-gray-700 text-white border-red-500 focus:ring-red-500",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);