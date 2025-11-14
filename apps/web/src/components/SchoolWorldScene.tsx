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

    // Create ground plane
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 50, height: 50 },
      scene
    );
    const groundMaterial = new StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new Color3(0.3, 0.6, 0.3); // Green grass
    ground.material = groundMaterial;

    // Create a simple school building block
    const building = MeshBuilder.CreateBox(
      "school-building",
      { width: 8, height: 6, depth: 10 },
      scene
    );
    building.position.y = 3; // Half the height to sit on ground

    const buildingMaterial = new StandardMaterial("buildingMat", scene);
    buildingMaterial.diffuseColor = new Color3(0.8, 0.7, 0.6); // Beige/brick color
    building.material = buildingMaterial;

    // If we have world data, log it for now (we'll use it later)
    if (worldData) {
      console.log("World data received:", worldData);
      // TODO: Use worldData to create multiple buildings based on buildingCount
      // For now, just change the building color based on postcode seed
      const hue = (worldData.postcode.charCodeAt(0) % 360) / 360;
      buildingMaterial.diffuseColor = Color3.FromHSV(hue * 360, 0.5, 0.8);
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
