"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress@1.1.2";

import { cn } from "./utils";

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number;
  showLabel?: boolean;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'accent' | 'xp';
}

function Progress({
  className,
  value,
  showLabel = false,
  variant = 'default',
  ...props
}: ProgressProps) {
  const percentage = value || 0;

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return {
          bar: 'bg-gradient-to-r from-primary via-secondary to-accent shadow-lg shadow-primary/30',
          bg: 'bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10'
        };
      case 'success':
        return {
          bar: 'bg-gradient-to-r from-success to-primary shadow-lg shadow-success/30',
          bg: 'bg-success/10'
        };
      case 'warning':
        return {
          bar: 'bg-gradient-to-r from-accent to-destructive shadow-lg shadow-accent/30',
          bg: 'bg-accent/10'
        };
      case 'accent':
        return {
          bar: 'bg-gradient-to-r from-accent to-secondary shadow-lg shadow-accent/30',
          bg: 'bg-accent/10'
        };
      case 'xp':
        return {
          bar: 'bg-gradient-to-r from-yellow-400 via-accent to-orange-500 shadow-lg shadow-accent/40',
          bg: 'bg-gradient-to-r from-yellow-400/10 via-accent/10 to-orange-500/10'
        };
      default:
        return {
          bar: 'bg-primary shadow-md shadow-primary/20',
          bg: 'bg-primary/20'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full border border-border/50",
          variantClasses.bg,
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full relative overflow-hidden",
            variantClasses.bar
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
      
      {showLabel && (
        <div className="absolute right-0 -top-5 text-xs font-medium text-muted-foreground">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export { Progress };
