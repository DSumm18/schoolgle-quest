"use client";

import { useEffect, useRef } from "react";
import type { Building } from "@schoolgle/shared";
import type { Camera } from "@babylonjs/core";

interface MiniMapProps {
  buildings: Building[];
  camera: Camera | null;
  worldSize: number; // Size of the world (terrain size)
}

export function MiniMap({ buildings, camera, worldSize }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !camera) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas display size
    const mapSize = 200; // 200x200px minimap
    canvas.width = mapSize;
    canvas.height = mapSize;

    // Calculate scale to fit the world into the minimap
    const scale = mapSize / worldSize;
    const centerOffset = mapSize / 2;

    const drawMinimap = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, mapSize, mapSize);

      // Draw background
      ctx.fillStyle = "rgba(30, 41, 59, 0.9)"; // slate-800
      ctx.fillRect(0, 0, mapSize, mapSize);

      // Draw grid
      ctx.strokeStyle = "rgba(71, 85, 105, 0.3)"; // slate-600 with transparency
      ctx.lineWidth = 1;
      const gridSpacing = 50 * scale; // Grid every 50 world units
      for (let i = 0; i <= mapSize; i += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, mapSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(mapSize, i);
        ctx.stroke();
      }

      // Draw center axes
      ctx.strokeStyle = "rgba(148, 163, 184, 0.5)"; // slate-400
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerOffset, 0);
      ctx.lineTo(centerOffset, mapSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, centerOffset);
      ctx.lineTo(mapSize, centerOffset);
      ctx.stroke();

      // Draw buildings
      for (const building of buildings) {
        // Convert world coordinates to minimap coordinates
        const x = centerOffset + building.position.x * scale;
        const z = centerOffset + building.position.z * scale;
        const width = building.size.x * scale;
        const depth = building.size.z * scale;

        // Determine building color
        let color = "#9CA3AF"; // Default gray
        if (building.isMainSchool) {
          color = "#FFD700"; // Gold for main school
        } else if (building.amenity === "school") {
          color = "#F59E0B"; // Amber for other schools
        } else if (building.amenity === "library") {
          color = "#3B82F6"; // Blue for libraries
        } else if (building.amenity === "hospital") {
          color = "#EF4444"; // Red for hospitals
        } else if (building.amenity === "church") {
          color = "#8B5CF6"; // Purple for churches
        } else if (building.amenity === "cafe" || building.amenity === "restaurant") {
          color = "#F97316"; // Orange for food
        }

        // Draw building rectangle
        ctx.fillStyle = color;
        ctx.fillRect(
          x - width / 2,
          z - depth / 2,
          width,
          depth
        );

        // Draw border for main school
        if (building.isMainSchool) {
          ctx.strokeStyle = "#FBBF24"; // Yellow border
          ctx.lineWidth = 2;
          ctx.strokeRect(
            x - width / 2 - 1,
            z - depth / 2 - 1,
            width + 2,
            depth + 2
          );
        }
      }

      // Draw player position (camera position)
      const playerX = centerOffset + camera.position.x * scale;
      const playerZ = centerOffset + camera.position.z * scale;

      // Player dot
      ctx.fillStyle = "#3B82F6"; // Blue
      ctx.beginPath();
      ctx.arc(playerX, playerZ, 4, 0, Math.PI * 2);
      ctx.fill();

      // Player direction indicator
      const forward = camera.getForwardRay().direction;
      const dirLength = 10;
      const dirX = playerX + forward.x * dirLength;
      const dirZ = playerZ + forward.z * dirLength;

      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playerX, playerZ);
      ctx.lineTo(dirX, dirZ);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(drawMinimap);
    };

    drawMinimap();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [buildings, camera, worldSize]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="rounded-lg border-2 border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-sm">
        <div className="mb-1 text-xs font-semibold text-slate-300 text-center">
          Map View
        </div>
        <canvas
          ref={canvasRef}
          className="rounded border border-slate-600"
          style={{ width: "200px", height: "200px" }}
        />
        <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#FFD700]"></div>
            <span>Your School</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
            <span>You</span>
          </div>
        </div>
      </div>
    </div>
  );
}
