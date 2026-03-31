import React from "react";
export default function Modal({ children }: any) {
    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
        {children}
      </div>
    );
  }