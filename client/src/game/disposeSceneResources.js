// Dispose scene-owned GPU resources once, including shared textures/materials.
export function disposeSceneResources(scene) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material ? [object.material] : [];
    objectMaterials.forEach(material => {
      materials.add(material);
      Object.values(material).forEach(value => {
        if (value && value.isTexture) textures.add(value);
      });
    });
  });

  textures.forEach(texture => texture.dispose());
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
  return { geometries: geometries.size, materials: materials.size, textures: textures.size };
}
