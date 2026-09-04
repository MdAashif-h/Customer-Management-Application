import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-[#07110e] shadow-[0_0_24px_rgba(85,196,157,0.16)] hover:bg-[#72d7b4] hover:shadow-[0_0_30px_rgba(85,196,157,0.28)]",
        outline: "border border-[var(--line)] bg-transparent text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--wash)]",
        ghost: "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-md px-3 text-xs",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };