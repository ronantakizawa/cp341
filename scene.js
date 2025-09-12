import * as THREE from 'three';

export let scene, camera, renderer;
export let ambientLight, directionalLight;

export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5483BF);
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, 20);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container').appendChild(renderer.domElement);
  
  addLighting();
  
  window.addEventListener('resize', onWindowResize, false);
}

function addLighting() {
  ambientLight = new THREE.AmbientLight(0x808080, 2.0);
  scene.add(ambientLight);
  
  directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(50, 50, 25);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function renderScene() {
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

export { onWindowResize };