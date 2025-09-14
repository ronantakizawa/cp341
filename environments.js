import * as THREE from 'three';
import { scene } from './scene.js';
import { mountainGroup } from './mountains.js';
import { loadCityPrototypes, cityGroup, updateCity, isCityReady, getCityBuildingObstacles, setCityVisible, resetCity } from './city.js';

let active = null;
let envs = {};
// Automatic switching removed; environments change only via keys 1 (mountains) and 2 (city)
let cityLoaded = false;

const buildingObstacles = [];
let cityDebugHelpersVisible = false;

export async function initEnvironments() {
  // Mountains env just references existing group
  envs.mountains = { group: mountainGroup, buildings: [] };
  if (!scene.getObjectByName('MountainGroup')) scene.add(mountainGroup);

  // Kick off city prototype load and streaming init
  loadCityPrototypes().then(() => {
    envs.city = { group: cityGroup, buildings: [] }; // buildings provided dynamically
    cityLoaded = true;
    setCityVisible(false); // hidden until activated
    console.log('City streaming loaded. Press 2 to view.');
  }).catch(e => console.error('City load failed:', e));

  setActive('mountains');
  registerEnvironmentKeys();
}

export function updateEnvironments(dt) {
  if (active === 'city' && cityLoaded) updateCity(dt);
}

export function getBuildingObstacles() {
  return buildingObstacles;
}

export function forceSwitch(name) {
  if (name === active) return;
  if (name === 'city' && !cityLoaded) {
    console.warn('City not loaded yet');
    return;
  }
  setActive(name);
}

// toggleAutoSwitch removed with auto-switch feature

function setActive(name) {
  if (!envs[name]) return;
  if (active) scene.remove(envs[active].group);
  active = name;
  scene.add(envs[name].group);

  // Rebuild obstacles
  buildingObstacles.length = 0;
  if (name === 'city') {
    setCityVisible(true);
    buildingObstacles.push(...getCityBuildingObstacles());
  } else {
    setCityVisible(false);
  }

  console.log(`Environment switched to: ${name} (buildings: ${buildingObstacles.length})`);
}

// loadCity removed in favor of streaming system

function registerEnvironmentKeys() {
  window.addEventListener('keydown', e => {
    if (e.key === '1') forceSwitch('mountains');
    if (e.key === '2') forceSwitch('city');
  // 'A' key previously toggled auto switch; feature removed
    if (e.key === 'C') toggleCityDebugHelpers();
  });
}

function toggleCityDebugHelpers() {
  cityDebugHelpersVisible = !cityDebugHelpersVisible;
  buildingObstacles.forEach(b => {
    if (!b.userData._helper) {
      const box = new THREE.Box3().setFromObject(b);
      const helper = new THREE.Box3Helper(box, 0xff0000);
      b.userData._helper = helper;
      scene.add(helper);
    }
    b.userData._helper.visible = cityDebugHelpersVisible;
  });
  console.log('City debug helpers:', cityDebugHelpersVisible);
}