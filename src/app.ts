import { QuickDraw } from "./debug/quickDraw";
import { reducedLog } from "./time/utils";
import "three/examples/js/controls/TrackballControls";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  TextGeometry,
  CubeGeometry,
  BackSide,
  Plane,
  Color,
  DoubleSide,
  MeshLambertMaterial,
  AmbientLight
} from "three";
import {
  BoxGeometry,
  PlaneGeometry,
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  TrackballControls
} from "three";
import { PointLight } from "three";

import { add, remove, UpdateFunctionType } from "./time/loop";
import MassPoint from "./MassPoint";
import DistanceConstraint from "./solvers/cpu/constraints/DistanceConstraint";
import IConstraint from "./solvers/cpu/constraints/IConstraint";
import BendingConstraint from "./solvers/cpu/constraints/BendingConstraint";
import { version } from "punycode";
import CollisionConstraint from "./solvers/cpu/constraints/CollisionConstraint";
import CpuSolver from "./solvers/cpu";
import GpuSolver from "./solvers/gpu";

const GRAVITY_FORCE = new Vector3(0, -3, 0);

const SIZE: number = 20;

const ITERATIONS = 30;

const log = reducedLog(100);

const calcIterationalStiffness = (stiffness: number) =>
  1 - Math.pow(1 - stiffness, 1 / ITERATIONS);

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = -10;

// skybox

const skyBoxGeometry = new CubeGeometry(50, 50, 50);
const skyBoxMaterial = new MeshBasicMaterial({
  color: 0x9999ff,
  side: BackSide
});
const skyBox = new Mesh(skyBoxGeometry, skyBoxMaterial);
scene.add(skyBox);

// debug

const quickDraw = new QuickDraw(scene);

const floor = quickDraw.drawPlane(new Vector3(0, -5, 0), 0xffff66, false);
floor.rotateX(-Math.PI / 2);

// Trackball camera setting
const controls = new TrackballControls(camera);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = false;
controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;
controls.keys = [65, 83, 68];

// renderer stuff
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light settings
var light = new AmbientLight(0x000066, 1); // soft white light
scene.add(light);

const pointLight = new PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Meshes
const geometry = new PlaneGeometry(6, 6, SIZE - 1, SIZE - 1);
geometry.rotateX(Math.PI / 2);

const material = new MeshLambertMaterial({
  color: 0xffffff,
  wireframe: false,
  side: DoubleSide
});

const cloth = new Mesh(geometry, material);
cloth.position.set(0, 0, 0);
scene.add(cloth);

const hookMesh = quickDraw.drawSphere(new Vector3(), 0x660000);
const hook = new MassPoint(hookMesh.position);

// some debugging spheres on vertices
const pointsMeshes = geometry.vertices.map(
  (_, i) =>
    new Mesh(
      new SphereGeometry(0.02),
      new MeshBasicMaterial({
        color: 0xeeeeee
      })
    )
);

for (let pM of pointsMeshes) {
  scene.add(pM);
}

let tempDeltaScaledVelocity = new Vector3();
let tempDeltaScaledGravity = new Vector3();

const solver = new CpuSolver(geometry, SIZE);
const gpuSolver = new GpuSolver(geometry, SIZE);
gpuSolver.setupConstraints();

solver.setFloor(new Vector3(0, -4.9, 0));

const update = (dt: number, time: number) => {
  hook.position.set(
    200 * Math.sin(time / 500),
    10 + SIZE * 2 + 50 * Math.cos(time / 500),
    20 * Math.cos(time / 500)
  );

  controls.update();

  tempDeltaScaledGravity.copy(GRAVITY_FORCE).multiplyScalar(dt);

  for (let massPoint of solver.massPoints) {
    massPoint.velocity.add(tempDeltaScaledGravity);
    massPoint.velocity.multiplyScalar(0.9);

    tempDeltaScaledVelocity.copy(massPoint.velocity);
    massPoint.nextPosition.addVectors(
      massPoint.position,
      tempDeltaScaledVelocity
    );
  }

  solver.solve();

  for (let massPoint of solver.massPoints) {
    massPoint.update();
  }

  for (let i in pointsMeshes) {
    pointsMeshes[i].position.copy(solver.massPoints[i].position);
  }

  geometry.normalsNeedUpdate = true;
  geometry.verticesNeedUpdate = true;
};

const render: UpdateFunctionType = (dt: number, time: number) => {
  renderer.render(scene, camera);
};

add(update, true);
add(render, false);
