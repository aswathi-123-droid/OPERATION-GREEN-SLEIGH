import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Mission } from '../types';
import { SECTOR_COORDINATES } from '../constants';

interface GlobalMapProps {
  missions: Mission[];
  onLocationSelect?: (data: { lat: number; lon: number; name: string }) => void;
}

const GlobalMap: React.FC<GlobalMapProps> = ({ missions, onLocationSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Ref to track mouse down position for differentiating click vs drag
  const mouseDownRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Init Scene ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Deep Space Background
    scene.background = new THREE.Color(0x000000); 

    // --- Starfield ---
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const posArray = new Float32Array(starCount * 3);
    for(let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 400; // Wider spread
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);


    // --- Init Camera ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18; 
    camera.position.y = 5;
    cameraRef.current = camera;

    // --- Init Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 6;
    controls.maxDistance = 50;
    controls.autoRotate = false; // DISABLED AUTO ROTATION
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);
    
    // Rim light
    const rimLight = new THREE.SpotLight(0x3b82f6, 5);
    rimLight.position.set(-20, 10, -10);
    rimLight.lookAt(0,0,0);
    scene.add(rimLight);

    // --- Earth Mesh ---
    const textureLoader = new THREE.TextureLoader();
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    
    // Textures
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecular,
      normalMap: earthNormal,
      specular: new THREE.Color(0x333333),
      shininess: 15
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.name = "Earth";
    scene.add(earth);
    earthRef.current = earth;

    // Cloud Layer
    const cloudGeometry = new THREE.SphereGeometry(5.05, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
       map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'),
       transparent: true,
       opacity: 0.8,
       blending: THREE.AdditiveBlending,
       side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earth.add(clouds); // Parent clouds to earth so they rotate with it

    // Atmosphere Glow
    const atmosphereGeo = new THREE.SphereGeometry(5.2, 64, 64);
    const atmosphereMat = new THREE.MeshPhongMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);

    // --- Markers Group ---
    // IMPORTANT: Add markers to Earth so they rotate with it
    const markersGroup = new THREE.Group();
    earth.add(markersGroup);
    markersRef.current = markersGroup;

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      // Disabled rotation for static planet
      // if (earth) earth.rotation.y += 0.0005;
      // if (clouds) clouds.rotation.y += 0.0002; 
      stars.rotation.y -= 0.0001; // Keep stars moving slowly for ambience
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // --- Interaction Handler (Click) ---
  useEffect(() => {
    if (!rendererRef.current || !containerRef.current) return;

    const canvas = rendererRef.current.domElement;

    const onPointerDown = (e: MouseEvent) => {
        mouseDownRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = async (event: MouseEvent) => {
      // Calculate distance moved to distinguish click from drag
      const diffX = Math.abs(event.clientX - mouseDownRef.current.x);
      const diffY = Math.abs(event.clientY - mouseDownRef.current.y);

      if (diffX > 5 || diffY > 5) return;

      if (!earthRef.current || !rendererRef.current || !cameraRef.current) return;

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      // Raycast against the Earth Mesh
      const intersects = raycasterRef.current.intersectObject(earthRef.current);

      if (intersects.length > 0) {
        setLoadingLocation(true);
        
        // IMPORTANT: Get intersection point in WORLD space
        const worldPoint = intersects[0].point;
        // Convert to LOCAL space of the Earth (accounts for rotation)
        const localPoint = earthRef.current.worldToLocal(worldPoint.clone());
        
        // Spherical Coordinates Calculation (Radius = 5)
        const R = 5;
        const phi = Math.acos(localPoint.y / R);
        const theta = Math.atan2(localPoint.z, -localPoint.x);

        const lat = 90 - (phi * (180 / Math.PI));
        let lon = (theta * (180 / Math.PI)) - 180;
        
        // Normalize Longitude to -180 to 180
        if (lon < -180) lon += 360;
        if (lon > 180) lon -= 360;

        // --- Visual feedback (Temporary Marker - CLEANER) ---
        if (markersRef.current) {
            const tempGroup = new THREE.Group();
            tempGroup.position.copy(localPoint);
            tempGroup.lookAt(0,0,0); // +Z points to center.
            
            // 1. Clean Wireframe Selection Hemisphere
            // Semi-sphere (0 to Math.PI / 2)
            const selGeo = new THREE.SphereGeometry(0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            // Rotate so top (Y) points along -Z (Out)
            selGeo.rotateX(-Math.PI / 2);
            
            const selMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.6 });
            const selBubble = new THREE.Mesh(selGeo, selMat);
            tempGroup.add(selBubble);

            // 2. White Core (Impact Point)
            const coreGeo = new THREE.SphereGeometry(0.05, 8, 8);
            // Slightly above surface (-Z direction)
            coreGeo.translate(0, 0, -0.05);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const core = new THREE.Mesh(coreGeo, coreMat);
            tempGroup.add(core);

            markersRef.current.add(tempGroup);
            
            // Animate removal
            const startTime = Date.now();
            const animateTemp = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed > 3000) {
                    if (markersRef.current && tempGroup) markersRef.current.remove(tempGroup);
                    return;
                }
                const scale = 1 + Math.sin(elapsed * 0.01) * 0.1;
                tempGroup.scale.set(scale, scale, scale);
                requestAnimationFrame(animateTemp);
            };
            animateTemp();
        }

        // Fetch location name
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const data = await response.json();
          
          let locationName = "Unknown Sector";
          if (data.city) locationName = `${data.city}, ${data.countryName}`;
          else if (data.locality) locationName = `${data.locality}, ${data.countryName}`;
          else if (data.principalSubdivision) locationName = `${data.principalSubdivision}, ${data.countryName}`;
          else if (data.countryName) locationName = data.countryName;
          
          if (!data.countryName) locationName = "International Waters (Ocean)";

          if (onLocationSelect) {
            onLocationSelect({ lat, lon, name: locationName });
          }
        } catch (error) {
          console.error("Geocoding failed", error);
          if (onLocationSelect) {
            onLocationSelect({ lat, lon, name: `Sector ${lat.toFixed(1)}, ${lon.toFixed(1)}` });
          }
        } finally {
          setLoadingLocation(false);
        }
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [onLocationSelect]);


  // Update markers when missions change
  useEffect(() => {
    if (!markersRef.current || !earthRef.current) return;

    // Clear existing markers
    while(markersRef.current.children.length > 0){ 
        markersRef.current.remove(markersRef.current.children[0]); 
    }

    missions.forEach((mission) => {
      let lat = 0, lon = 0;

      if (mission.coordinates) {
        lat = mission.coordinates.lat;
        lon = mission.coordinates.lon;
      } else {
        // Fallback for missions without coords
        let coords = SECTOR_COORDINATES[mission.sector];
        if (!coords) {
          const foundKey = Object.keys(SECTOR_COORDINATES).find(key => mission.sector.includes(key));
          if (foundKey) {
              coords = SECTOR_COORDINATES[foundKey];
          } else {
              // Deterministic random based on ID
              const hash = mission._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              lat = (hash % 160) - 80;
              lon = ((hash * 13) % 360) - 180;
          }
        }
        if (coords) {
           lat = coords.lat;
           lon = coords.lon;
        }
      }

      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const radius = 5;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));

      // DYNAMIC SEMISPHERE SIZING & COLORS
      // Pending -> Large (0.4), Red
      // Dispatching -> Medium (0.25), Yellow
      // Cleaned -> Small (0.15), Green
      
      let color = 0xef4444; 
      let size = 0.4; 

      if (mission.status === 'Dispatching') {
         color = 0xeab308; // Yellow
         size = 0.25;
      } else if (mission.status === 'Cleaned') {
         color = 0x22c55e; // Green
         size = 0.15;
      }

      // Create Group for Marker
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.lookAt(0, 0, 0); // +Z points to center of earth
      
      // Clean Hemisphere (Dome) Geometry
      // radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength
      // thetaLength = PI/2 creates top half (0 to 90deg)
      const geometry = new THREE.SphereGeometry(size, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      
      // Rotate -90 deg on X to align the dome (Y-up) to point Outwards (-Z)
      geometry.rotateX(-Math.PI / 2);

      const material = new THREE.MeshPhongMaterial({ 
          color: color, 
          transparent: true,
          opacity: 0.85,
          emissive: color,
          emissiveIntensity: 0.6,
          shininess: 30
      });
      const dome = new THREE.Mesh(geometry, material);
      group.add(dome);

      // Simple Base Ring (Glow)
      const ringGeo = new THREE.RingGeometry(size * 1.0, size * 1.3, 32);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: color, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = -0.01; // Slightly above surface
      group.add(ring);
      
      markersRef.current?.add(group);
    });

  }, [missions]);

  return (
    <div className="w-full h-[450px] md:h-[550px] relative group overflow-hidden bg-black">
       {/* Canvas Container */}
       <div ref={containerRef} className="w-full h-full cursor-move bg-black" />
       
       <div className="absolute top-6 left-6 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-blue-500/20 text-blue-200 text-xs font-bold font-orbitron tracking-widest uppercase shadow-lg flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${loadingLocation ? 'bg-yellow-400 animate-ping' : 'bg-green-400'}`}></div>
             {loadingLocation ? "TRIANGULATING COORDINATES..." : "SATELLITE UPLINK ESTABLISHED"}
          </div>
       </div>
       
       <div className="absolute bottom-6 left-6 pointer-events-none">
          <div className="text-white/70 text-[10px] font-mono max-w-xs bg-slate-900/60 p-3 rounded border border-white/5 backdrop-blur-sm">
             >> INTERACTIVE MODE ENABLED<br/>
             >> CLICK TARGET ZONE TO DEPLOY
          </div>
       </div>

       <div className="absolute bottom-6 right-6 pointer-events-none flex flex-col gap-2 text-xs font-bold">
          <div className="flex items-center gap-2 bg-slate-900/80 p-2 px-3 rounded-lg shadow-lg text-white border border-white/10">
             <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span> Pending
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 p-2 px-3 rounded-lg shadow-lg text-white border border-white/10">
             <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Dispatching
          </div>
           <div className="flex items-center gap-2 bg-slate-900/80 p-2 px-3 rounded-lg shadow-lg text-white border border-white/10">
             <span className="w-2 h-2 rounded-full bg-green-500"></span> Cleaned
          </div>
       </div>
    </div>
  );
};

export default GlobalMap;