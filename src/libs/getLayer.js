import * as THREE from "three";

const loader = new THREE.TextureLoader();

function getSprite({ color, opacity, pos, size, rotation }) {
  const spriteMat = new THREE.SpriteMaterial({
    color,
    map: loader.load("./src/libs/rad-grad.png"),
    transparent: true,
    opacity,
  });

  spriteMat.color.offsetHSL(0, 0, Math.random() * 0.2 - 0.1);

  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.copy(pos);
  sprite.scale.set(size, size, size);
  sprite.material.rotation = rotation;

  return sprite;
}

function getLayer({
  hue = 0.0,
  sat = 1.0,
  light = 0.5,
  numSprites = 10,
  opacity = 1,
  radius = 1,
  size = 1,
  z = 0,
  depth = 0.0,
  randomizePosition = true,
  randomizeSize = true,
  randomizeRotation = true,
}) {
  const group = new THREE.Group();

  for (let i = 0; i < numSprites; i++) {
    const angle = (i / numSprites) * Math.PI * 2;
    const r = randomizePosition ? radius * (0.7 + Math.random() * 0.3) : radius;

    const pos = new THREE.Vector3(
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      z + (depth ? Math.random() * depth : 0)
    );

    const finalSize = randomizeSize ? size * (0.75 + Math.random() * 0.5) : size;
    const finalRotation = randomizeRotation ? Math.random() * Math.PI * 2 : 0;

    const color = new THREE.Color().setHSL(hue, sat, light);
    const sprite = getSprite({ color, opacity, pos, size: finalSize, rotation: finalRotation });

    group.add(sprite);
  }

  return group;
}

export default getLayer;