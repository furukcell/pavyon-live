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
