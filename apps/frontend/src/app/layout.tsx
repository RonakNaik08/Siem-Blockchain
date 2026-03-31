import React from "react";
import "../styles/globals.css";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

export const metadata = {
  title: "SIEM Dashboard",
  description: "Blockchain-based Log Integrity System"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-gray-200 font-mono">
        <div className="flex h-screen overflow-hidden">
          
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            
            {/* Topbar */}
            <Topbar />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}