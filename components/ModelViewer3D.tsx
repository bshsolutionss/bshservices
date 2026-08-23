"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ModelViewer3DProps {
  className?: string;
}

export default function ModelViewer3D({ className = "" }: ModelViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 4.2);

    // Renderer setup
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      container.appendChild(renderer.domElement);
    } catch (e) {
      console.error("WebGL initialization failed:", e);
      setError("WebGL not supported");
      setLoading(false);
      return;
    }

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Hero logo should stay consistently sized
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.maxPolarAngle = Math.PI / 1.6;
    controls.minPolarAngle = Math.PI / 2.8;

    // Lighting setup for rich 3D metallic and blue shaders
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainKeyLight.position.set(4, 6, 5);
    mainKeyLight.castShadow = true;
    scene.add(mainKeyLight);

    const blueFillLight = new THREE.DirectionalLight(0x3b82f6, 1.5);
    blueFillLight.position.set(-5, -2, -3);
    scene.add(blueFillLight);

    const cyanRimLight = new THREE.PointLight(0x60a5fa, 2.5, 15);
    cyanRimLight.position.set(0, 4, 3);
    scene.add(cyanRimLight);

    const bottomGlowLight = new THREE.PointLight(0x1a14a5, 2.0, 10);
    bottomGlowLight.position.set(0, -3, 2);
    scene.add(bottomGlowLight);

    // Group for holding and floating the model
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // Load Materials and OBJ
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath("/images/");
    mtlLoader.load(
      "pc-solutions-mark.mtl",
      (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath("/images/");
        objLoader.load(
          "pc-solutions-mark.obj",
          (object) => {
            // Compute bounding box to center & auto-scale
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // Scale to fill viewport nicely (target size ~2.6 units in scene)
            const targetDim = 2.5;
            const scale = targetDim / (maxDim || 1);

            object.scale.setScalar(scale);

            // Center geometry inside pivot group
            object.position.x = -center.x * scale;
            object.position.y = -center.y * scale;
            object.position.z = -center.z * scale;

            // Enhance materials with double-side & subtle shininess
            object.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                if (mesh.material) {
                  const mats = Array.isArray(mesh.material)
                    ? mesh.material
                    : [mesh.material];
                  mats.forEach((m) => {
                    m.side = THREE.DoubleSide;
                    if ("shininess" in m) {
                      (m as THREE.MeshPhongMaterial).shininess = 60;
                    }
                  });
                }
              }
            });

            // Initial slight tilt for aesthetic presentation
            pivotGroup.rotation.x = 0.15;
            pivotGroup.rotation.y = -0.2;
            pivotGroup.add(object);

            setLoading(false);
          },
          (xhr) => {
            if (xhr.lengthComputable && xhr.total > 0) {
              setProgress(Math.round((xhr.loaded / xhr.total) * 100));
            }
          },
          (err) => {
            console.error("Error loading OBJ model:", err);
            setError("Failed to load 3D model");
            setLoading(false);
          }
        );
      },
      (xhr) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          setProgress(Math.round((xhr.loaded / xhr.total) * 50));
        }
      },
      (err) => {
        console.error("Error loading MTL materials:", err);
        // If MTL fails, fallback to loading OBJ without materials
        const objLoader = new OBJLoader();
        objLoader.setPath("/images/");
        objLoader.load(
          "pc-solutions-mark.obj",
          (object) => {
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(
              box.getSize(new THREE.Vector3()).x,
              box.getSize(new THREE.Vector3()).y,
              box.getSize(new THREE.Vector3()).z
            );
            const scale = 2.5 / (maxDim || 1);
            object.scale.setScalar(scale);
            object.position.x = -center.x * scale;
            object.position.y = -center.y * scale;
            object.position.z = -center.z * scale;

            const defaultMat = new THREE.MeshStandardMaterial({
              color: 0x1a14a5,
              metalness: 0.5,
              roughness: 0.3,
            });
            object.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = defaultMat;
              }
            });

            pivotGroup.add(object);
            setLoading(false);
          },
          undefined,
          () => {
            setError("Failed to load 3D logo");
            setLoading(false);
          }
        );
      }
    );

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (controls) {
        controls.update();
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      if (controls) {
        controls.dispose();
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }

      // Dispose geometries and materials
      pivotGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            const mats = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            mats.forEach((m) => m.dispose());
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
      title="3D Interactive Logo - Click and drag to rotate"
    >
      {/* Loading Skeleton & Spinner */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Pulsing outer ring */}
            <div className="w-24 h-24 rounded-full border-2 border-[#1A14A5]/30 border-t-[#1A14A5] animate-spin"></div>
            {/* Glowing core */}
            <div className="absolute w-12 h-12 rounded-full bg-[#1A14A5]/20 backdrop-blur-md animate-pulse"></div>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#1A14A5]/80">
            {progress > 0 ? `Loading 3D Logo (${progress}%)` : "Loading 3D Logo..."}
          </p>
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <p className="text-sm text-red-500 bg-white/80 p-3 rounded-xl shadow-sm border border-red-100">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
