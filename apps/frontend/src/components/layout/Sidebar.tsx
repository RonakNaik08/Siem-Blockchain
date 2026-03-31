
import React from "react";
import { Home, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
export default function Sidebar() {
  return (
    <div className="w-16 bg-[#020617] h-screen border-r border-gray-800 flex flex-col items-center py-4 gap-6">
      <Link href="/dashboard"><Home size={18} /></Link>
      <Link href="/logs"><FileText size={18} /></Link>
      <Link href="/alerts"><AlertTriangle size={18} /></Link>
    </div>
  );
}