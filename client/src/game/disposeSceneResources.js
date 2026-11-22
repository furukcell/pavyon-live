// Dispose scene-owned GPU resources once, including shared and nested uniform textures.
export function disposeSceneResources(scene) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const inspectedValues = new WeakSet();

  function collectTextures(value, inspectMaterial = false) {
    if (!value || typeof value !== 'object') return;
    if (value.isTexture) {
      textures.add(value);
      return;
    }
    if (inspectedValues.has(value)) return;
    inspectedValues.add(value);

    // Three.js uniforms commonly hold textures inside { value }, arrays or
    // plain nested objects. Avoid walking arbitrary Three.js class instances.
    if (Array.isArray(value)) {
      value.forEach(collectTextures);
      return;
    }
    const prototype = Object.getPrototypeOf(value);
    if (inspectMaterial || prototype === Object.prototype || prototype === null) {
      Object.values(value).forEach(collectTextures);
    }
  }

  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material ? [object.material] : [];
    objectMaterials.forEach(material => {
      materials.add(material);
      collectTextures(material, true);
    });
  });

  textures.forEach(texture => texture.dispose());
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
  return { geometries: geometries.size, materials: materials.size, textures: textures.size };
}
