import { cn } from "./utils";
import { Progress } from "./progress";
import { Trophy, Star, Target, Zap } from "lucide-react";

interface ScoreCardProps {
  score: number;
  maxScore?: number;
  label: string;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'accent' | 'xp';
  icon?: 'trophy' | 'star' | 'target' | 'zap';
  className?: string;
  showPercentage?: boolean;
}

export function ScoreCard({
  score,
  maxScore = 100,
  label,
  variant = 'gradient',
  icon = 'star',
  className,
  showPercentage = true
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (icon) {
      case 'trophy':
        return <Trophy className={iconClass} />;
      case 'star':
        return <Star className={iconClass} />;
      case 'target':
        return <Target className={iconClass} />;
      case 'zap':
        return <Zap className={iconClass} />;
      default:
        return <Star className={iconClass} />;
    }
  };

  const getGradientClass = () => {
    switch (variant) {
      case 'gradient':
        return 'from-primary/5 via-secondary/5 to-accent/5';
      case 'success':
        return 'from-success/5 to-primary/5';
      case 'warning':
        return 'from-accent/5 to-destructive/5';
      case 'accent':
        return 'from-accent/5 to-secondary/5';
      case 'xp':
        return 'from-yellow-400/5 via-accent/5 to-orange-500/5';
      default:
        return 'from-primary/5 to-secondary/5';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-accent';
      case 'accent':
        return 'text-accent';
      case 'xp':
        return 'text-accent';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-4 backdrop-blur-sm border border-border/50",
      "bg-gradient-to-br",
      getGradientClass(),
      "hover-lift transition-all duration-300",
      className
    )}>
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50" />
      
      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl bg-gradient-to-br",
              getGradientClass(),
              "border border-border/50",
              getIconColor()
            )}>
              {getIcon()}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          {showPercentage && (
            <span className="text-base font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              {Math.round(percentage)}%
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <Progress value={percentage} variant={variant} className="h-3" />

        {/* Score */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Score: {score}</span>
          <span>Max: {maxScore}</span>
        </div>
      </div>
    </div>
  );
}

interface CircularScoreProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'accent' | 'xp';
  label?: string;
  showLabel?: boolean;
}

export function CircularScore({
  score,
  maxScore = 100,
  size = 'md',
  variant = 'gradient',
  label,
  showLabel = true
}: CircularScoreProps) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-28 h-28', text: 'text-base', label: 'text-sm' },
    lg: { container: 'w-36 h-36', text: 'text-base', label: 'text-base' }
  };

  const getStrokeColor = () => {
    switch (variant) {
      case 'success':
        return 'stroke-success';
      case 'warning':
        return 'stroke-accent';
      case 'accent':
        return 'stroke-accent';
      case 'xp':
        return 'stroke-accent';
      case 'gradient':
        return 'stroke-primary';
      default:
        return 'stroke-primary';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", sizeClasses[size].container)}>
        {/* Background circle */}
        <svg className="absolute inset-0 -rotate-90 transform">
          <circle
            cx="50%"
            cy="50%"
            r="40"
            className="stroke-muted/30"
            fill="none"
            strokeWidth="8"
          />
        </svg>

        {/* Progress circle */}
        <svg className="absolute inset-0 -rotate-90 transform">
          <circle
            cx="50%"
            cy="50%"
            r="40"
            className={cn(getStrokeColor(), "transition-all duration-1000 ease-out drop-shadow-lg")}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 8px currentColor)`
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent", sizeClasses[size].text)}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {showLabel && label && (
        <span className={cn("text-muted-foreground font-medium", sizeClasses[size].label)}>
          {label}
        </span>
      )}
    </div>
  );
}
