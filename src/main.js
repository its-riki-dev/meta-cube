import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";
import getLayer from "./libs/getLayer.js";

// Scene Setup
const amount = 20;
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = amount * 1.8;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('canvas') });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Camera responsiveness
function updateCameraForMobile() {
  if (window.innerWidth < 768) {
    camera.fov = 75;
    camera.position.z = amount * 2.2;
  } else {
    camera.fov = 60;
    camera.position.z = amount * 1.8;
  }
  camera.updateProjectionMatrix();
}
updateCameraForMobile();
window.addEventListener('resize', updateCameraForMobile);

// GUI Setup
const params = {
  speed: 0.0003,
  cubeSize: 0.5,
  noiseHue: 0.95,
};

const gui = new GUI();
gui.add(params, 'speed', 0.0001, 0.01).name('Animation Speed');
gui.add(params, 'cubeSize', 0.1, 2).name('Cube Size').onChange((val) => {
  mesh.geometry.dispose();
  mesh.geometry = new THREE.BoxGeometry(val, val, val);
});
gui.add(params, 'noiseHue', 0.0, 1.0).name('Noise Hue');

// Instanced Cubes
const count = Math.pow(amount, 3);
const dummy = new THREE.Object3D();
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const geometry = new THREE.BoxGeometry(params.cubeSize, params.cubeSize, params.cubeSize);
const mesh = new THREE.InstancedMesh(geometry, material, count);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
scene.add(mesh);

const offset = (amount - 1) / 2;
const noise = new ImprovedNoise();
const nAmp = 0.1;
const nScale = 3;
const clr = new THREE.Color(0xff0000);

dummy.userData = {
  update: ({ i, x, y, z, time }) => {
    dummy.position.set(offset - x, offset - y, offset - z);
    const nz = noise.noise(time + x * nAmp, time + y * nAmp, time + z * nAmp) * nScale;
    dummy.scale.setScalar(nz);

    clr.setHSL(params.noiseHue + nz * 0.1, 1.0, 0.2 + nz * 0.1);
    mesh.setColorAt(i, clr);
    mesh.instanceColor.needsUpdate = true;
  }
};

// Sprites Background
const sprites = getLayer({
  hue: 0.6,
  numSprites: 8,
  opacity: 0.1,
  radius: 30,
  size: 64,
  z: -20.0,
});
scene.add(sprites);

// Animate
function animate(t) {
  render(t);
  controls.update();
}

// Render
function render(time = 0) {
  time *= params.speed;
  mesh.rotation.x = Math.sin(time * 0.25);
  mesh.rotation.y = Math.sin(time * 0.2);

  let i = 0;
  for (let x = 0; x < amount; x++) {
    for (let y = 0; y < amount; y++) {
      for (let z = 0; z < amount; z++) {
        dummy.userData.update({ i, x, y, z, time });
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
  }
  renderer.render(scene, camera);
}

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
