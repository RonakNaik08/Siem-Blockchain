import React from "react";
export default function Badge({ text }: any) {
    return (
      <span className="text-xs bg-gray-700 px-2 rounded">
        {text}
      </span>
    );
  }