"use client";

import { useState } from "react";

export default function HomePage() {
  const [postcode, setPostcode] = useState("");

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
          />
          <button
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold hover:bg-sky-400"
            onClick={() => {
              // Claude will wire this to the API + 3D view
              console.log("Generate world for", postcode);
            }}
          >
            Generate world
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="font-semibold mb-2">3D World Preview</h3>
        <p className="text-sm opacity-75">
          Claude: mount the Babylon.js canvas here and render the generated
          school world for the current postcode.
        </p>
        <div className="mt-3 h-64 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-xs opacity-60">
          3D canvas placeholder
        </div>
      </section>
    </main>
  );
}
