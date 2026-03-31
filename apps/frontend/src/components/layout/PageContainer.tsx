import React from "react";
export default function PageContainer({ children }: any) {
    return (
      <div className="p-6 w-full">
        {children}
      </div>
    );
  }