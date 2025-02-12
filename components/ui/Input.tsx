import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export  function Input(props: InputProps) {
  return (
    <input
      className="w-full px-4 py-2 border border-gray-700 bg-gray-900 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      {...props}
    />
  );
}
