import React from "react";
export const Button = ({ children, ...props }: any) => (
    <button
      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
      {...props}
    >
      {children}
    </button>
  );