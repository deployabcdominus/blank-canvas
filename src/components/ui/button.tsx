import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 will-change-transform transform-gpu",
  {
    variants: {
      variant: {
        default: "btn-violet btn-spring",
        destructive:
          "border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition-colors duration-200",
        outline:
          "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200",
        secondary:
          "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors duration-200",
        ghost: "hover:bg-white/5 hover:text-white transition-colors duration-200",
        link: "text-primary font-bold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 md:h-10 px-4 py-2",
        sm: "h-9 md:h-8 rounded-lg px-3 py-1",
        lg: "h-12 md:h-11 rounded-lg px-8",
        icon: "h-11 w-11 md:h-10 md:w-10",
      },

    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
