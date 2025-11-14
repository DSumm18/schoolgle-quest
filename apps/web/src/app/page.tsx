"use client";

import { useState } from "react";
import { SchoolWorldScene } from "../components/SchoolWorldScene";
import type { WorldData } from "@schoolgle/shared";

export default function HomePage() {
  const [postcode, setPostcode] = useState("");
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerateWorld = async () => {
    if (!postcode.trim()) {
      setError("Please enter a postcode");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/generate-world", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ postcode })
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to generate world");
        return;
      }

      setWorldData(result.data.worldData);
      setMessage(result.message);
      console.log("World generated:", result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold mb-2">
          Start your Schoolgle Quest
        </h2>
        <p className="text-sm mb-4 opacity-80">
          Enter a UK postcode to generate a demo 3D school world and quest data.
        </p>
        <div className="flex gap-2">
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            placeholder="e.g. LS19 7XB"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-400"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGenerateWorld();
              }
            }}
          />
          <button
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerateWorld}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate world"}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-3 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-400">
            {message}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="font-semibold mb-2">3D World Preview</h3>
        <p className="text-sm opacity-75 mb-3">
          {worldData
            ? `Showing 3D world for ${worldData.postcode}. Use WASD or arrow keys to move the camera.`
            : "Enter a postcode above and click Generate to see the 3D world."}
        </p>
        <div className="h-96 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden">
          {worldData ? (
            <SchoolWorldScene worldData={worldData} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs opacity-60">
              3D canvas will appear here after generating a world
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
