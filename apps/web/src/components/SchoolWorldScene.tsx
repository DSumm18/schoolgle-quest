"use client";

import { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  UniversalCamera,
  KeyboardEventTypes
} from "@babylonjs/core";
import type { WorldData } from "@schoolgle/shared";

interface SchoolWorldSceneProps {
  worldData?: WorldData | null;
}

export function SchoolWorldScene({ worldData }: SchoolWorldSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Babylon.js engine
    const engine = new Engine(canvasRef.current, true);
    engineRef.current = engine;

    // Create scene
    const scene = new Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new Color3(0.5, 0.7, 0.9).toColor4(); // Sky blue

    // Create camera (Universal camera for WASD movement)
    const camera = new UniversalCamera(
      "camera",
      new Vector3(0, 5, -15),
      scene
    );
    camera.setTarget(new Vector3(0, 2, 0));
    camera.attachControl(canvasRef.current, true);

    // Camera settings
    camera.speed = 0.5;
    camera.angularSensibility = 2000;

    // Set up WASD and arrow keys
    camera.keysUp = [87, 38]; // W, Up Arrow
    camera.keysDown = [83, 40]; // S, Down Arrow
    camera.keysLeft = [65, 37]; // A, Left Arrow
    camera.keysRight = [68, 39]; // D, Right Arrow

    // Add lighting
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Create ground plane (size based on terrain data)
    const groundSize = worldData?.terrain.size.x || 50;
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: groundSize, height: groundSize },
      scene
    );
    const groundMaterial = new StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new Color3(0.3, 0.6, 0.3); // Green grass
    ground.material = groundMaterial;

    // Create buildings from world data
    if (worldData && worldData.buildings && worldData.buildings.length > 0) {
      console.log(`Rendering ${worldData.buildings.length} buildings from ${worldData.postcode}`);

      for (const buildingData of worldData.buildings) {
        // Create box for each building
        const buildingMesh = MeshBuilder.CreateBox(
          buildingData.id,
          {
            width: buildingData.size.x,
            height: buildingData.size.y,
            depth: buildingData.size.z
          },
          scene
        );

        // Position the building
        buildingMesh.position.x = buildingData.position.x;
        buildingMesh.position.y = buildingData.position.y;
        buildingMesh.position.z = buildingData.position.z;

        // Apply material with color
        const material = new StandardMaterial(`mat-${buildingData.id}`, scene);

        // Parse hex color to Color3
        const hexColor = buildingData.color || "#C8B4A0";
        const r = parseInt(hexColor.slice(1, 3), 16) / 255;
        const g = parseInt(hexColor.slice(3, 5), 16) / 255;
        const b = parseInt(hexColor.slice(5, 7), 16) / 255;

        material.diffuseColor = new Color3(r, g, b);
        buildingMesh.material = material;
      }

      // Adjust camera position based on building spread
      camera.position = new Vector3(-50, 30, -50);
      camera.setTarget(new Vector3(0, 0, 0));
    } else {
      // Fallback: single building if no data
      const building = MeshBuilder.CreateBox(
        "fallback-building",
        { width: 8, height: 6, depth: 10 },
        scene
      );
      building.position.y = 3;

      const material = new StandardMaterial("fallbackMat", scene);
      material.diffuseColor = new Color3(0.8, 0.7, 0.6);
      building.material = material;
    }

    // Run the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [worldData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-xl"
      style={{ touchAction: "none" }}
    />
  );
}
