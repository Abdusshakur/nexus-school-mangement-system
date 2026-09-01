import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Spinner({ size = "md", className = "", ...props }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
