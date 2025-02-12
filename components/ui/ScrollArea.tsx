import React, { ReactNode } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string; // Allow className as an optional prop
}

export  function ScrollArea({ children, className }: ScrollAreaProps) {
  return <div className={`overflow-y-auto max-h-[400px] ${className}`}>{children}</div>;
}
