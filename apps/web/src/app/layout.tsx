import type { ReactNode } from "react";
import "../globals.css";

export const metadata = {
  title: "Schoolgle Quest",
  description: "3D school world + real-world exploration for UK schools"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl p-4">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Schoolgle Quest
            </h1>
            <span className="text-xs opacity-70">
              Early demo build
            </span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
