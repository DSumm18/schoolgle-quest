"use client";

import { useEffect, useState, useRef } from "react";
import { Vector3 } from "@babylonjs/core";
import type { Building } from "@schoolgle/shared";
import type { Scene, Camera } from "@babylonjs/core";

interface BuildingLabelsOverlayProps {
  buildings: Building[];
  scene: Scene | null;
  camera: Camera | null;
  canvasWidth: number;
  canvasHeight: number;
}

interface LabelPosition {
  building: Building;
  x: number;
  y: number;
  visible: boolean;
}

export function BuildingLabelsOverlay({
  buildings,
  scene,
  camera,
  canvasWidth,
  canvasHeight
}: BuildingLabelsOverlayProps) {
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!scene || !camera) return;

    // Filter buildings that should have labels
    const labeledBuildings = buildings.filter(
      (b) =>
        b.isMainSchool ||
        b.amenity === "school" ||
        b.amenity === "library" ||
        b.amenity === "hospital" ||
        b.amenity === "church" ||
        b.name // Show any building with a name
    );

    const updateLabelPositions = () => {
      const positions: LabelPosition[] = [];

      for (const building of labeledBuildings) {
        // Get the top position of the building for label placement
        const worldPos = new Vector3(
          building.position.x,
          building.position.y + building.size.y / 2 + 2, // Above the building
          building.position.z
        );

        // Project 3D world position to 2D screen coordinates
        const projectedPos = Vector3.Project(
          worldPos,
          scene.getTransformMatrix(),
          scene.getProjectionMatrix(),
          scene.activeCamera!.viewport.toGlobal(canvasWidth, canvasHeight)
        );

        // Check if position is in front of camera (not behind)
        const cameraToBuilding = worldPos.subtract(camera.position);

        // Simple dot product check with camera forward direction
        const forward = camera.getForwardRay().direction;
        const dotProduct = Vector3.Dot(cameraToBuilding, forward);

        // Distance check - only show labels for buildings within reasonable distance
        const distance = cameraToBuilding.length();

        const visible =
          dotProduct > 0 && // In front of camera
          distance < 150 && // Within 150 units
          projectedPos.x >= 0 &&
          projectedPos.x <= canvasWidth &&
          projectedPos.y >= 0 &&
          projectedPos.y <= canvasHeight;

        positions.push({
          building,
          x: projectedPos.x,
          y: projectedPos.y,
          visible
        });
      }

      setLabelPositions(positions);
      animationFrameRef.current = requestAnimationFrame(updateLabelPositions);
    };

    updateLabelPositions();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [buildings, scene, camera, canvasWidth, canvasHeight]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {labelPositions.map(
        ({ building, x, y, visible }) =>
          visible && (
            <div
              key={building.id}
              className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-auto"
              style={{
                left: `${x}px`,
                top: `${y}px`
              }}
            >
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                {building.isMainSchool && (
                  <span className="text-yellow-400 mr-1">⭐</span>
                )}
                {building.amenity === "school" && !building.isMainSchool && (
                  <span className="mr-1">🏫</span>
                )}
                {building.amenity === "library" && <span className="mr-1">📖</span>}
                {building.amenity === "hospital" && <span className="mr-1">🏥</span>}
                {building.amenity === "church" && <span className="mr-1">⛪</span>}
                {building.amenity === "cafe" && <span className="mr-1">☕</span>}
                {building.amenity === "restaurant" && <span className="mr-1">🍽️</span>}

                <span className={building.isMainSchool ? "font-bold text-yellow-300" : "text-slate-200"}>
                  {building.name ||
                    (building.amenity
                      ? building.amenity.charAt(0).toUpperCase() + building.amenity.slice(1)
                      : building.type.replace("_", " "))}
                </span>

                {building.amenity && (
                  <span className="ml-1 text-sky-400 text-[10px]">
                    [{building.amenity}]
                  </span>
                )}
              </div>
            </div>
          )
      )}
    </div>
  );
}
