import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';

const loader = new GLTFLoader();

let chunkSpeed = 0.75; // Constant speed for simpler mode
const chunkSpacing = 180; // Distance between chunk origins along Z
const visibleChunks = 5; // How many ahead at once
// Narrower playfield: fewer lanes closer to screen center
const laneWidth = 80; // reduced from 105
const lanes = [-1.5, -0.5, 0.5, 1.5];
// Vertical baseline for building placement (raise to bring obstacles up)
let buildingBaseY = -40; // was -115; adjust until tops align with bird path

let prototypeBuildings = []; // Building prototype roots
let chunks = []; // Active chunk groups
export const cityGroup = new THREE.Group();
cityGroup.name = 'CityStreamGroup';

export let cityReady = false;

export function isCityReady() { return cityReady; }

export async function loadCityPrototypes() {
  if (cityReady) return; // already loaded
  const files = ['city.glb','city1.glb','city2.glb','city3.glb','city4.glb']; // more can be added
  const loaded = [];
  for (const f of files) {
    try {
      const gltf = await new Promise((res, rej) => loader.load(`./${f}`, res, undefined, rej));
      const root = gltf.scene.clone(true);
      normalizePrototype(root);
      root.userData.sourceFile = f;
      loaded.push(root);
    } catch (e) {
      console.warn(`City prototype load skipped (${f}):`, e.message || e);
    }
  }

  if (loaded.length === 0) {
    console.warn('City: no building GLBs loaded.');
  }

  prototypeBuildings = loaded;

  // Initial chunk population
  for (let i = 0; i < visibleChunks; i++) {
    spawnChunk(-i * chunkSpacing - 400); // start further negative Z
  }
  scene.add(cityGroup);
  cityReady = true;
  console.log(`City streaming ready. Prototypes loaded: ${prototypeBuildings.length}`);
}

function normalizePrototype(root) {
  // Compute bounding box height to decide scaling normalization (optional)
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  // Normalize extremely large models down
  const targetMaxHeight = 110; // lower target height for obstacles
  let scaleFactor = 1;
  if (size.y > targetMaxHeight) {
    scaleFactor = targetMaxHeight / size.y;
    root.scale.multiplyScalar(scaleFactor);
  }
  // Apply additional uniform downscale to make obstacles less imposing
  root.scale.multiplyScalar(0.7);
  // Lift so its base sits around y=0 relative to placement offset later
  const newBox = new THREE.Box3().setFromObject(root);
  const minY = newBox.min.y;
  root.position.y -= minY; // base to 0
}

function spawnChunk(zBase) {
  const group = new THREE.Group();
  group.name = 'CityChunk';
  group.position.set(0, 0, zBase);

  // Guarantee at least two empty lanes: choose occupied lanes subset
  const lanePool = [...lanes];
  shuffleInPlace(lanePool);
  const buildingsThisChunk = Math.min(3, Math.max(2, prototypeBuildings.length >= 2 ? 2 + Math.floor(Math.random()*2) : 2));
  const occupiedLanes = lanePool.slice(0, buildingsThisChunk); // leaves remaining lanes empty
  for (const lane of occupiedLanes) {
    addBuilding(group, lane, THREE.MathUtils.randFloat(0.55,0.75));
  }

  cityGroup.add(group);
  chunks.push(group);
}

export function updateCity(dt) {
  if (!cityReady) return;
  for (let i = chunks.length - 1; i >= 0; i--) {
    const c = chunks[i];
    c.position.z += chunkSpeed;
    if (c.position.z > 120) { // passed camera, recycle
      cityGroup.remove(c);
      chunks.splice(i, 1);
      spawnChunk(getFurthestZ() - chunkSpacing);
    }
  }
}

function getFurthestZ() {
  let minZ = 0;
  for (const c of chunks) {
    if (c.position.z < minZ) minZ = c.position.z;
  }
  return minZ;
}

export function getCityBuildingObstacles() {
  const obstacles = [];
  for (const chunk of chunks) {
    chunk.traverse(o => { if (o.isMesh && o.userData.isBuilding) obstacles.push(o); });
  }
  return obstacles;
}

export function setCityVisible(v) {
  cityGroup.visible = v;
}

export function resetCity() {
  chunks.forEach(c => cityGroup.remove(c));
  chunks = [];
  for (let i = 0; i < visibleChunks; i++) {
    spawnChunk(-i * chunkSpacing - 400);
  }
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Pattern system removed for simplified obstacle field

function addBuilding(chunkGroup, lane, scaleFactor, localZOffset = 0) {
  const protoRoot = prototypeBuildings[Math.floor(Math.random() * prototypeBuildings.length)];
  const b = protoRoot.clone(true);
  b.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData.isBuilding = true; }});
  // Slight vertical jitter for variation
  const yJitter = (Math.random()-0.5) * 6;
  b.position.set(lane * laneWidth + (Math.random()-0.5)*15, buildingBaseY + yJitter, localZOffset + (Math.random()-0.5)*10);
  b.scale.multiplyScalar(scaleFactor);
  chunkGroup.add(b);
  return b;
}