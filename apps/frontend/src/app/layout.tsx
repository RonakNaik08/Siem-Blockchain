import React from "react";
import type { Metadata } from "next";
import "../styles/globals.css";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SIEM Dashboard",
  description: "Blockchain-based Log Integrity System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-200 antialiased">

        {/* Toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0a0f1e",
              color: "#e2e8f0",
              border: "1px solid rgba(34,211,238,0.2)",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            },
          }}
        />

        <div className="flex h-screen overflow-hidden">

          {/* SIDEBAR */}
          <aside className="hidden md:flex">
            <Sidebar />
          </aside>

          {/* MAIN AREA */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* TOPBAR */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
              <Topbar />
            </div>

            {/* CONTENT */}
            <main className="flex-1 overflow-y-auto p-6">
              <div className="max-w-[1400px] mx-auto space-y-6">
                {children}
              </div>
            </main>

          </div>
        </div>

      </body>
    </html>
  );
}