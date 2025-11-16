"use client";

import type { Building } from "@schoolgle/shared";

interface BuildingInfoPanelProps {
  building: Building | null;
  onClose: () => void;
}

export function BuildingInfoPanel({ building, onClose }: BuildingInfoPanelProps) {
  if (!building) return null;

  // Building type descriptions
  const descriptions: Record<string, string> = {
    main_building: "The main school building. A hub of learning and activity.",
    classroom: "A classroom where students learn and grow.",
    library: "A quiet place for reading and research.",
    gym: "Physical education and sports facilities.",
    cafeteria: "Where students gather for meals and socializing.",
    office: "Administrative offices and staff rooms."
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>

          {/* Special indicator for main school */}
          {building.isMainSchool && (
            <div className="mb-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="font-semibold text-yellow-300">Your School</span>
            </div>
          )}

          {/* Building icon based on type or amenity */}
          <div className="text-4xl mb-3">
            {(building.amenity === "school" || building.type === "main_building") && "🏫"}
            {building.amenity === "library" && "📖"}
            {building.amenity === "cafe" && "☕"}
            {building.amenity === "restaurant" && "🍽️"}
            {building.amenity === "shop" && "🏪"}
            {building.amenity === "hospital" && "🏥"}
            {building.amenity === "church" && "⛪"}
            {!building.amenity && building.type === "classroom" && "📚"}
            {!building.amenity && building.type === "gym" && "🏋️"}
            {!building.amenity && building.type === "cafeteria" && "🍽️"}
            {!building.amenity && building.type === "office" && "💼"}
          </div>

          {/* Building name (if available) */}
          <h3 className="text-xl font-bold mb-2">
            {building.name || (
              <span className="capitalize">
                {building.amenity || building.type.replace("_", " ")}
              </span>
            )}
          </h3>

          {/* Building type/amenity tag */}
          {building.amenity && (
            <div className="mb-3">
              <span className="inline-block bg-sky-500/20 text-sky-300 px-2 py-1 rounded text-xs font-medium">
                {building.amenity}
              </span>
            </div>
          )}

          <p className="text-sm text-slate-300 mb-4">
            {building.amenity ? (
              `Real ${building.amenity} from OpenStreetMap`
            ) : (
              descriptions[building.type] || "An interesting building."
            )}
          </p>

          {/* Building stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="rounded-lg bg-slate-800/50 p-2">
              <div className="text-xs text-slate-400">Dimensions</div>
              <div className="font-mono text-sky-400">
                {Math.round(building.size.x)} × {Math.round(building.size.z)}m
              </div>
            </div>
            <div className="rounded-lg bg-slate-800/50 p-2">
              <div className="text-xs text-slate-400">Height</div>
              <div className="font-mono text-sky-400">
                {Math.round(building.size.y)}m
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 font-semibold transition-colors">
              Start Quest Here
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-slate-600 hover:bg-slate-800 px-4 py-2 font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
