import {
  Scene,
  Color,
  Vector3,
  Material,
  SphereGeometry,
  Mesh,
  MeshBasicMaterial
} from "three";

export class QuickDraw {
  scene: Scene;
  sphereGeometry: SphereGeometry;
  materials: Map<number, Material>;

  constructor(scene: Scene) {
    this.scene = scene;
    this.materials = new Map();
    this.sphereGeometry = new SphereGeometry(0.2);
  }

  drawSphere(position: Vector3, color: number = 0xff0000) {
    let material = this.materials.get(color);
    if (!material) {
      material = new MeshBasicMaterial({
        color,
        wireframe: false,
        opacity: 0.9
      });
      this.materials.set(color, material);
    }

    const sphereMesh = new Mesh(this.sphereGeometry, material);
    sphereMesh.position.copy(position);
    sphereMesh.rotateY(Math.random());
    this.scene.add(sphereMesh);
    return sphereMesh;
  }
}
