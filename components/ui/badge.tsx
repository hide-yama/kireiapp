import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 hover:border-primary/30 hover:from-primary/15 hover:to-primary/10",
        secondary:
          "bg-gradient-to-r from-secondary/80 to-secondary/60 text-secondary-foreground border border-secondary/20 hover:from-secondary/90 hover:to-secondary/70",
        destructive:
          "bg-gradient-to-r from-destructive/10 to-destructive/5 text-destructive border border-destructive/20 hover:border-destructive/30 hover:from-destructive/15 hover:to-destructive/10",
        outline: 
          "border-2 border-border/50 text-foreground bg-transparent hover:bg-accent/5 hover:border-accent/50",
        success:
          "bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 dark:text-green-400 border border-green-500/20 hover:border-green-500/30 hover:from-green-500/15 hover:to-green-500/10",
        warning:
          "bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:border-amber-500/30 hover:from-amber-500/15 hover:to-amber-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }