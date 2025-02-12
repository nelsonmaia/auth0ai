import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export  function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${className}`} {...props} />
  );
}
