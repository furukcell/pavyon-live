import test from 'node:test';
import assert from 'node:assert/strict';
import { disposeSceneResources } from './disposeSceneResources.js';

test('disposes shared scene resources exactly once', () => {
  const calls = { geometry: 0, material: 0, texture: 0 };
  const texture = { isTexture: true, dispose: () => calls.texture++ };
  const material = { map: texture, dispose: () => calls.material++ };
  const geometry = { dispose: () => calls.geometry++ };
  const scene = {
    traverse(visitor) {
      visitor({ geometry, material });
      visitor({ geometry, material: [material, { dispose: () => calls.material++ }] });
    }
  };

  const result = disposeSceneResources(scene);
  assert.deepEqual(result, { geometries: 1, materials: 2, textures: 1 });
  assert.deepEqual(calls, { geometry: 1, material: 2, texture: 1 });
});

test('supports scenes without GPU resources', () => {
  const result = disposeSceneResources({ traverse(visitor) { visitor({}); } });
  assert.deepEqual(result, { geometries: 0, materials: 0, textures: 0 });
});

test('disposes nested actor resources including shared textures once', () => {
  const calls = { geometry: 0, material: 0, texture: 0 };
  const texture = { isTexture: true, dispose: () => calls.texture++ };
  const material = { map: texture, normalMap: texture, dispose: () => calls.material++ };
  const geometry = { dispose: () => calls.geometry++ };
  const child = { geometry, material };
  const actor = {
    traverse(visitor) {
      visitor({ geometry, material });
      visitor(child);
    }
  };

  const result = disposeSceneResources(actor);
  assert.deepEqual(result, { geometries: 1, materials: 1, textures: 1 });
  assert.deepEqual(calls, { geometry: 1, material: 1, texture: 1 });
});

test('finds textures nested in shader uniforms and cyclic user data', () => {
  const calls = { material: 0, uniformTexture: 0, userTexture: 0 };
  const uniformTexture = { isTexture: true, dispose: () => calls.uniformTexture++ };
  const userTexture = { isTexture: true, dispose: () => calls.userTexture++ };
  const material = {
    uniforms: { uScene: { value: [uniformTexture, { nested: uniformTexture }] } },
    userData: { texture: userTexture },
    dispose: () => calls.material++
  };
  material.userData.self = material.userData;
  const scene = { traverse(visitor) { visitor({ material }); } };

  const result = disposeSceneResources(scene);
  assert.deepEqual(result, { geometries: 0, materials: 1, textures: 2 });
  assert.deepEqual(calls, { material: 1, uniformTexture: 1, userTexture: 1 });
});
