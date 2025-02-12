import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
    return <div className={`bg-gray-800 p-4 rounded-lg shadow-md ${className}`}>{children}</div>;
  }

export function CardContent({ children, className }: { children: ReactNode, className? : string }) {
  return <div className="text-white">{children}</div>;
}
