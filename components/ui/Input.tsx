import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

const inputVariants = cva(
  "flex w-full rounded-md border text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground",
  {
    variants: {
      variant: {
        default: "border-input bg-background",
        outline: "border border-gray-300 bg-white",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      size: {
        sm: "h-8 px-2",
        md: "h-10 px-3",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  asChild?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant,
      size,
      iconLeft,
      iconRight,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp className="relative w-full">
        {iconLeft && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size }),
            {
              "pl-10": iconLeft,
              "pr-10": iconRight,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {iconRight && (
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 pointer-events-none">
            {iconRight}
          </span>
        )}
      </Comp>
    );
  }
);

Input.displayName = "Input";
