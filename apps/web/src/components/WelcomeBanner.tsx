"use client";

import { useEffect, useState } from "react";
import type { Building } from "@schoolgle/shared";

interface WelcomeBannerProps {
  mainSchool: Building | null;
  postcode: string;
  region?: string;
  buildingCount: number;
  onDismiss?: () => void;
}

export function WelcomeBanner({
  mainSchool,
  postcode,
  region,
  buildingCount,
  onDismiss
}: WelcomeBannerProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-in fade-in duration-500">
      <div className="relative max-w-lg mx-4 pointer-events-auto">
        <div className="rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 shadow-2xl backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors text-xl"
          >
            ×
          </button>

          {/* Welcome message */}
          <div className="text-center">
            <div className="text-5xl mb-3">🗺️</div>

            {mainSchool && mainSchool.name ? (
              <>
                <h2 className="text-2xl font-bold mb-2 text-yellow-300">
                  Welcome to {mainSchool.name}!
                </h2>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-xl">⭐</span>
                  <span className="text-sm text-slate-300">Your School</span>
                </div>
              </>
            ) : (
              <h2 className="text-2xl font-bold mb-3 text-yellow-300">
                Welcome to Your School World!
              </h2>
            )}

            <div className="space-y-2 text-sm text-slate-300 mb-4">
              <p>
                This map shows <span className="font-semibold text-sky-400">{buildingCount} real buildings</span> from OpenStreetMap
              </p>
              <p>
                Near <span className="font-semibold text-green-400">{postcode}</span>
                {region && <span className="text-slate-400"> ({region})</span>}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                This is geographically accurate data from your area!
              </p>
            </div>

            {/* Controls hint */}
            <div className="border-t border-slate-700 pt-4 mt-4">
              <p className="text-xs text-slate-400 mb-2">Controls:</p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">WASD</kbd>
                  <span className="text-slate-400">Move</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">Mouse</kbd>
                  <span className="text-slate-400">Look</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-600">Click</kbd>
                  <span className="text-slate-400">Interact</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="mt-4 w-full rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 font-semibold transition-colors text-sm"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
