import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ArrowRight, Compass, RotateCcw } from 'lucide-react';
import { useFirebaseData } from '../context/FirebaseDataContext';
import type { LocationArea } from '../types/pg';
import { SafeImage } from './SafeImage';

type CameraZone = 'Overview' | LocationArea;

interface ZoneCameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  accentHex: number;
}

const CAMERA_PRESETS: Record<CameraZone, ZoneCameraConfig> = {
  Overview: {
    position: [0.6, 8.8, 12.8],
    target: [0, 0.7, 0],
    accentHex: 0x6d28d9,
  },
  'Law Gate': {
    position: [-5.8, 4.9, 6.8],
    target: [-3.4, 1.1, 0.8],
    accentHex: 0x2563eb,
  },
  Phagwara: {
    position: [1.2, 5.2, 7.6],
    target: [0.3, 1.0, -1.8],
    accentHex: 0x6d28d9,
  },
  Jalandhar: {
    position: [6.4, 5.1, 6.9],
    target: [3.6, 1.1, 0.9],
    accentHex: 0x4f46e5,
  },
};

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createRoadMapTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep architectural slate ground
    ctx.fillStyle = '#141e3c';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle architectural grid lines
    ctx.strokeStyle = 'rgba(148, 163, 214, 0.14)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Curved connecting campus highway road linking Law Gate -> Phagwara -> Jalandhar
    ctx.strokeStyle = '#253566';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(95, 290);
    ctx.quadraticCurveTo(256, 150, 420, 295);
    ctx.stroke();

    // Glowing indigo center route dashed line
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(95, 290);
    ctx.quadraticCurveTo(256, 150, 420, 295);
    ctx.stroke();
    ctx.setLineDash([]);

    // Soft zone halos under the 3 hubs
    const drawHalo = (x: number, y: number, color: string) => {
      const grad = ctx.createRadialGradient(x, y, 8, x, y, 74);
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(20, 30, 60, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 74, 0, Math.PI * 2);
      ctx.fill();
    };
    drawHalo(125, 285, 'rgba(37, 99, 235, 0.42)');
    drawHalo(260, 195, 'rgba(109, 40, 217, 0.42)');
    drawHalo(392, 290, 'rgba(79, 70, 229, 0.42)');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function buildCompositeBuildingCluster(
  zone: LocationArea,
  accentHex: number,
  sharedMaterials: {
    stone: THREE.MeshStandardMaterial;
    facadeLight: THREE.MeshStandardMaterial;
    facadeSlate: THREE.MeshStandardMaterial;
    glass: THREE.MeshPhysicalMaterial;
    roofTrim: THREE.MeshStandardMaterial;
  },
): { group: THREE.Group; pin: THREE.Group; hitProxy: THREE.Mesh } {
  const group = new THREE.Group();
  group.name = zone;

  // Grounded beveled architectural podium (bottom sits flush at y = 0)
  const podiumGeo = new THREE.CylinderGeometry(2.15, 2.35, 0.24, 32);
  const podium = new THREE.Mesh(podiumGeo, sharedMaterials.stone);
  podium.position.y = 0.12;
  podium.receiveShadow = true;
  group.add(podium);

  // Subtle accent ring on top of podium (offset +0.02 to avoid z-fighting)
  const ringGeo = new THREE.RingGeometry(1.78, 1.94, 36);
  const ringMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.26;
  group.add(ring);

  // Build distinctive 6-9 part architectural residence silhouettes per zone
  const mainHeight = zone === 'Law Gate' ? 2.55 : zone === 'Phagwara' ? 2.15 : 2.85;
  const mainWidth = zone === 'Phagwara' ? 1.45 : 1.35;
  const mainDepth = 1.25;

  // 1. Primary Tower Hull
  const mainTower = new THREE.Mesh(
    new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth),
    sharedMaterials.facadeLight,
  );
  mainTower.position.set(-0.32, 0.24 + mainHeight / 2, 0.05);
  mainTower.castShadow = true;
  mainTower.receiveShadow = true;
  group.add(mainTower);

  // 2. Recessed Glazed Curtain Wall / Window Strips on Front & Side
  const windowRows = zone === 'Jalandhar' ? 4 : 3;
  for (let i = 0; i < windowRows; i++) {
    const wy = 0.72 + i * 0.52;
    if (wy < 0.24 + mainHeight - 0.25) {
      const glassBand = new THREE.Mesh(
        new THREE.BoxGeometry(mainWidth + 0.04, 0.22, mainDepth * 0.72),
        sharedMaterials.glass,
      );
      glassBand.position.set(-0.32, wy, 0.05);
      group.add(glassBand);
    }
  }

  // 3. Secondary Residence Wing
  const wingHeight = mainHeight * 0.64;
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, wingHeight, 1.1),
    sharedMaterials.facadeSlate,
  );
  wing.position.set(0.68, 0.24 + wingHeight / 2, -0.18);
  wing.castShadow = true;
  wing.receiveShadow = true;
  group.add(wing);

  // 4. Secondary Wing Glazed Balcony Strip
  const wingGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.22, 1.14),
    sharedMaterials.glass,
  );
  wingGlass.position.set(0.68, 0.24 + wingHeight * 0.58, -0.18);
  group.add(wingGlass);

  // 5. Roof Parapet / Canopy Frame
  const roofCap = new THREE.Mesh(
    new THREE.BoxGeometry(mainWidth + 0.14, 0.12, mainDepth + 0.14),
    sharedMaterials.roofTrim,
  );
  roofCap.position.set(-0.32, 0.24 + mainHeight + 0.06, 0.05);
  group.add(roofCap);

  // 6. Entrance Canopy Porch
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.08, 0.45),
    sharedMaterials.roofTrim,
  );
  canopy.position.set(-0.32, 0.72, mainDepth / 2 + 0.22);
  group.add(canopy);

  // 7. Accent Rooftop Beacon Fin
  const beaconMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.5,
  });
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.14), beaconMat);
  fin.position.set(-0.32, 0.24 + mainHeight + 0.22, 0.05);
  group.add(fin);

  // 8. Composite Sculpted Floating Location Pin (Lathe/Cone + Sphere + Halo)
  const pin = new THREE.Group();
  const pinHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 20),
    beaconMat,
  );
  pinHead.position.y = 0.42;
  pin.add(pinHead);

  const pinCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.46, 20),
    beaconMat,
  );
  pinCone.rotation.x = Math.PI;
  pinCone.position.y = 0.12;
  pin.add(pinCone);

  const pinCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 14, 14),
    sharedMaterials.facadeLight,
  );
  pinCore.position.set(0, 0.42, 0.2);
  pin.add(pinCore);

  pin.position.set(0, mainHeight + 0.92, 0);
  group.add(pin);

  // Invisible simplified raycast hit proxy for crisp click/hover targeting
  const hitProxy = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, mainHeight + 2.1, 16),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitProxy.position.y = (mainHeight + 2.1) / 2;
  hitProxy.userData = { zone };
  group.add(hitProxy);

  return { group, pin, hitProxy };
}

export function Campus3DStage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeZone, setActiveZone] = useState<CameraZone>('Overview');
  const [hoveredZone, setHoveredZone] = useState<LocationArea | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const activeZoneRef = useRef<CameraZone>('Overview');
  const triggerCameraPresetRef = useRef<((zone: CameraZone) => void) | null>(
    null,
  );

  const { getLocationHubs } = useFirebaseData();
  const hubs = getLocationHubs();
  const selectedHub =
    activeZone === 'Overview'
      ? hubs[0]
      : hubs.find((h) => h.area === activeZone) ?? hubs[0];

  const handleSelectZone = (zone: CameraZone) => {
    setActiveZone(zone);
    activeZoneRef.current = zone;
    triggerCameraPresetRef.current?.(zone);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 440;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
        preserveDrawingBuffer: isSoftwareGl,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1533);
    scene.fog = new THREE.FogExp2(0x0b1533, 0.028);

    // Mandatory studio environment map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(...CAMERA_PRESETS.Overview.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.Overview.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.22;
    controls.minPolarAngle = 0.35;
    controls.autoRotate = !isSoftwareGl;
    controls.autoRotateSpeed = 0.45;
    controls.update();

    // Warm/cool 3-point studio lighting rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x172554, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.2);
    keyLight.position.set(8, 13, 9);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -9;
    keyLight.shadow.camera.right = 9;
    keyLight.shadow.camera.top = 9;
    keyLight.shadow.camera.bottom = -9;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.15);
    rimLight.position.set(-9, 6, -8);
    scene.add(rimLight);

    // Sculpted Architectural Ground Base
    const roadTex = createRoadMapTexture(
      renderer.capabilities.getMaxAnisotropy(),
    );
    const groundGeo = new THREE.CylinderGeometry(9.6, 10.2, 0.55, 64);
    const groundSideMat = new THREE.MeshStandardMaterial({
      color: 0x0f1c42,
      roughness: 0.72,
      metalness: 0.25,
    });
    const groundTopMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.08,
    });
    const ground = new THREE.Mesh(groundGeo, [
      groundSideMat,
      groundTopMat,
      groundSideMat,
    ]);
    ground.position.y = -0.275;
    ground.receiveShadow = true;
    scene.add(ground);

    // Outer architectural compass ring
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(9.75, 0.055, 12, 72),
      new THREE.MeshStandardMaterial({
        color: 0x4f46e5,
        emissive: 0x3730a3,
        emissiveIntensity: 0.35,
        roughness: 0.28,
        metalness: 0.75,
      }),
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.02;
    scene.add(outerRing);

    // Shared calibrated PBR materials
    const sharedMaterials = {
      stone: new THREE.MeshStandardMaterial({
        color: 0x1e2b54,
        roughness: 0.72,
        metalness: 0.18,
      }),
      facadeLight: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.58,
        metalness: 0.06,
      }),
      facadeSlate: new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.62,
        metalness: 0.1,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.35,
        roughness: 0.12,
        metalness: 0.25,
        clearcoat: 1.0,
      }),
      roofTrim: new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        roughness: 0.32,
        metalness: 0.65,
      }),
    };

    // Build 3 Composite Zone Clusters (Law Gate, Phagwara, Jalandhar)
    const lawGateCluster = buildCompositeBuildingCluster(
      'Law Gate',
      CAMERA_PRESETS['Law Gate'].accentHex,
      sharedMaterials,
    );
    lawGateCluster.group.position.set(-3.4, 0, 0.8);
    scene.add(lawGateCluster.group);

    const phagwaraCluster = buildCompositeBuildingCluster(
      'Phagwara',
      CAMERA_PRESETS.Phagwara.accentHex,
      sharedMaterials,
    );
    phagwaraCluster.group.position.set(0.3, 0, -1.8);
    phagwaraCluster.group.rotation.y = 0.45;
    scene.add(phagwaraCluster.group);

    const jalandharCluster = buildCompositeBuildingCluster(
      'Jalandhar',
      CAMERA_PRESETS.Jalandhar.accentHex,
      sharedMaterials,
    );
    jalandharCluster.group.position.set(3.6, 0, 0.9);
    jalandharCluster.group.rotation.y = -0.35;
    scene.add(jalandharCluster.group);

    const pins = [
      { pin: lawGateCluster.pin, baseY: lawGateCluster.pin.position.y, phase: 0 },
      {
        pin: phagwaraCluster.pin,
        baseY: phagwaraCluster.pin.position.y,
        phase: 1.8,
      },
      {
        pin: jalandharCluster.pin,
        baseY: jalandharCluster.pin.position.y,
        phase: 3.4,
      },
    ];
    const hitProxies = [
      lawGateCluster.hitProxy,
      phagwaraCluster.hitProxy,
      jalandharCluster.hitProxy,
    ];

    // InstancedMesh stylized campus trees along perimeter & avenues
    const treePositions: Array<[number, number]> = [
      [-6.5, -2.2], [-6.2, 2.8], [-5.2, -4.6], [-2.5, -5.8],
      [2.8, -5.6], [5.8, -4.2], [6.6, -1.2], [6.2, 3.2],
      [2.2, 4.6], [-1.8, 4.8], [-4.8, 4.2], [0.2, 3.9],
      [-1.5, -0.4], [1.9, -0.2], [-5.4, 0.1], [5.4, -0.5],
      [-3.2, -3.5], [3.5, -3.4], [-0.4, -4.6], [4.4, 4.1],
      [-4.1, 3.3], [0.9, 2.2],
    ];
    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.55, 8);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x3b2f2f,
      roughness: 0.9,
    });
    const crownGeo = new THREE.DodecahedronGeometry(0.38, 1);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.72,
    });

    const trunks = new THREE.InstancedMesh(
      trunkGeo,
      trunkMat,
      treePositions.length,
    );
    const crowns = new THREE.InstancedMesh(
      crownGeo,
      crownMat,
      treePositions.length,
    );
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();

    treePositions.forEach(([x, z], i) => {
      const s = 0.85 + ((i * 37) % 30) / 100;
      dummy.position.set(x, 0.275 * s, z);
      dummy.scale.set(s, s, s);
      dummy.rotation.y = i * 0.7;
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, 0.72 * s, z);
      dummy.updateMatrix();
      crowns.setMatrixAt(i, dummy.matrix);

      tint.setHSL(0.41 + ((i % 4) - 1.5) * 0.02, 0.48, 0.34 + (i % 3) * 0.04);
      crowns.setColorAt(i, tint);
    });
    trunks.computeBoundingSphere();
    crowns.computeBoundingSphere();
    scene.add(trunks);
    scene.add(crowns);

    // Pre-allocated scratch math helpers (zero GC inside animation loop)
    const desiredCamPos = new THREE.Vector3(...CAMERA_PRESETS.Overview.position);
    const desiredTarget = new THREE.Vector3(...CAMERA_PRESETS.Overview.target);
    let transitionActive = false;

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const startTimeMs = performance.now();
    let lastTimeMs = startTimeMs;

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = window.requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        if (transitionActive) {
          camera.position.copy(desiredCamPos);
          controls.target.copy(desiredTarget);
          transitionActive = false;
        }
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty && !disposed) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    function animateGpu() {
      if (disposed) return;
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastTimeMs) / 1000, 0.05);
      lastTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;

      for (const item of pins) {
        item.pin.position.y = item.baseY + Math.sin(elapsed * 2.1 + item.phase) * 0.16;
        item.pin.rotation.y += dt * 0.9;
      }

      if (transitionActive) {
        const lambda = 5.5;
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          desiredCamPos.x,
          lambda,
          dt,
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          desiredCamPos.y,
          lambda,
          dt,
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          desiredCamPos.z,
          lambda,
          dt,
        );
        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          desiredTarget.x,
          lambda,
          dt,
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          desiredTarget.y,
          lambda,
          dt,
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          desiredTarget.z,
          lambda,
          dt,
        );

        if (
          camera.position.distanceTo(desiredCamPos) < 0.05 &&
          controls.target.distanceTo(desiredTarget) < 0.05
        ) {
          transitionActive = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animateGpu);
    }

    triggerCameraPresetRef.current = (zone: CameraZone) => {
      const preset = CAMERA_PRESETS[zone];
      desiredCamPos.set(...preset.position);
      desiredTarget.set(...preset.target);
      transitionActive = true;
      if (isSoftwareGl) {
        camera.position.copy(desiredCamPos);
        controls.target.copy(desiredTarget);
        transitionActive = false;
        controls.update();
        renderer.render(scene, camera);
      }
    };

    const onControlStart = () => {
      transitionActive = false;
    };
    const onControlChange = () => {
      if (isSoftwareGl) requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    // Raycast hover & click selection on 3D clusters
    let lastHoverCheck = 0;
    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 60) return;
      lastHoverCheck = now;
      updatePointer(event);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitProxies, false);
      if (hits.length > 0) {
        const zone = hits[0].object.userData.zone as LocationArea;
        setHoveredZone(zone);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredZone(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    let downX = 0;
    let downY = 0;
    const onPointerDown = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) return;
      updatePointer(event);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitProxies, false);
      if (hits.length > 0) {
        const zone = hits[0].object.userData.zone as LocationArea;
        setActiveZone(zone);
        activeZoneRef.current = zone;
        triggerCameraPresetRef.current?.(zone);
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    let lastW = width;
    let lastH = height;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || disposed) return;
      const w = Math.max(240, Math.floor(entry.contentRect.width));
      const h = Math.max(240, Math.floor(entry.contentRect.height));
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (isSoftwareGl) {
        controls.update();
        renderer.render(scene, camera);
      }
    });
    resizeObserver.observe(container);

    if (isSoftwareGl) {
      controls.update();
      renderer.render(scene, camera);
    } else {
      renderer.compile(scene, camera);
      animateGpu();
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        onContextLost,
      );
      controls.dispose();
      roadTex.dispose();
      envRT.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  const zones: CameraZone[] = ['Overview', 'Law Gate', 'Phagwara', 'Jalandhar'];

  return (
    <div
      data-testid="campus-3d-stage"
      data-zone={activeZone}
      className="relative w-full h-[410px] sm:h-[460px] lg:h-full min-h-[430px] rounded-2xl overflow-hidden border border-[#1E2B54] bg-[#0B1533] shadow-xl flex flex-col"
    >
      {/* Minimal Top-Left Label (solid rgba, zero backdrop-blur over WebGL) */}
      <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1533]/90 border border-white/15 text-xs text-white font-medium">
          <Compass className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>
            Interactive 3D Campus Map
            {hoveredZone ? ` · ${hoveredZone}` : ''}
          </span>
        </div>
      </div>

      {/* Reset Camera Button */}
      {activeZone !== 'Overview' && (
        <button
          type="button"
          onClick={() => handleSelectZone('Overview')}
          aria-label="Reset 3D map camera to overview"
          className="absolute top-3.5 right-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1533]/90 hover:bg-[#172554] border border-white/15 text-xs text-white font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset View</span>
        </button>
      )}

      {/* Isolated WebGL Canvas Container */}
      {webglFailed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
          <p className="font-display text-lg font-bold">
            Law Gate · Phagwara · Jalandhar
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Select a zone below to preview real PGs.
          </p>
        </div>
      ) : (
        <div ref={mountRef} className="w-full flex-1 min-h-0" />
      )}

      {/* Unified Bottom Dock (solid rgba, never occludes center 3D model) */}
      <div className="relative z-10 bg-[#0B1533]/96 border-t border-white/12 p-3 sm:p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="group"
            aria-label="3D Map Zone Presets"
            className="flex items-center gap-1 bg-white/8 p-1 rounded-lg overflow-x-auto"
          >
            {zones.map((zone) => {
              const isActive = activeZone === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => handleSelectZone(zone)}
                  aria-pressed={isActive}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {zone}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-slate-300 hidden sm:inline">
            Drag to rotate 3D · Click a building cluster
          </span>
        </div>

        {/* Real PG Snapshot Strip for the Selected 3D Zone */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 border border-white/15">
              <SafeImage
                src={selectedHub.image}
                alt={`Real PG in ${selectedHub.displayTitle}`}
                fallbackTitle={selectedHub.displayTitle}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {selectedHub.displayTitle}{' '}
                <span className="font-mono text-[#93C5FD] font-normal">
                  · {selectedHub.count} real stays
                </span>
              </p>
              <p className="text-[11px] text-slate-300 truncate">
                {selectedHub.subtitle}
              </p>
            </div>
          </div>

          <Link
            to={`/explore?location=${encodeURIComponent(selectedHub.area)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
