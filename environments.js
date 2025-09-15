import { scene } from './scene.js';
import { mountainGroup } from './mountains.js';

let active = null;
let envs = {};

export function initEnvironments() {
  envs.mountains = { group: mountainGroup };
  if (!scene.getObjectByName('MountainGroup')) scene.add(mountainGroup);
  setActive('mountains');
  registerEnvironmentKeys();
}

export function updateEnvironments(dt) {
  // No city update needed
}

export function getBuildingObstacles() {
  return [];
}

export function forceSwitch(name) {
  if (name === active) return;
  setActive(name);
}

function setActive(name) {
  if (!envs[name]) return;
  if (active) scene.remove(envs[active].group);
  active = name;
  scene.add(envs[name].group);
  console.log(`Environment switched to: ${name}`);
}

function registerEnvironmentKeys() {
  window.addEventListener('keydown', e => {
    if (e.key === '1') forceSwitch('mountains');
  });
}