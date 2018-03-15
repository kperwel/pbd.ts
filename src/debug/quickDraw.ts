import {
  Scene,
  Color,
  Vector3,
  Material,
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry
} from "three";

export class QuickDraw {
  scene: Scene;
  sphereGeometry: SphereGeometry;
  planeGeometry: PlaneGeometry;
  materials: Map<number, Material>;

  constructor(scene: Scene) {
    this.scene = scene;
    this.materials = new Map();
    this.sphereGeometry = new SphereGeometry(0.2);
    this.planeGeometry = new PlaneGeometry(10, 10);
  }

  getMaterial(color: number = 0xff0000, wireframe = false) {
    let material = this.materials.get(color);
    if (!material) {
      material = new MeshBasicMaterial({
        color,
        wireframe,
        opacity: 0.9
      });
      this.materials.set(color, material);
    }

    return material;
  }

  drawSphere(position: Vector3, color: number = 0xff0000, wireframe = false) {
    let material = this.getMaterial(color, wireframe);

    const sphereMesh = new Mesh(this.sphereGeometry, material);
    sphereMesh.position.copy(position);
    sphereMesh.rotateY(Math.random());
    this.scene.add(sphereMesh);
    return sphereMesh;
  }

  drawPlane(position: Vector3, color: number = 0xff0000, wireframe = false) {
    let material = this.getMaterial(color, wireframe);

    const mesh = new Mesh(this.planeGeometry, material);
    mesh.position.copy(position);
    this.scene.add(mesh);
    return mesh;
  }
}
