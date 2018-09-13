import { QuickDraw } from "./debug/quickDraw";
import { reducedLog } from "./time/utils";
import "three/examples/js/controls/TrackballControls";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  CubeGeometry,
  BackSide,
  DoubleSide,
  MeshLambertMaterial,
  AmbientLight
} from "three";
import {
  PlaneGeometry,
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  TrackballControls
} from "three";
import { PointLight } from "three";

import { add, UpdateFunctionType } from "./time/loop";
import MassPoint from "./MassPoint";
import CpuSolver from "./solvers/cpu";
import { Prealocator } from "./solvers/Prealocator";

const GRAVITY_FORCE = new Vector3(0, -3, 0);

const SIZE: number = 39;

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
var light = new AmbientLight(0x666666, 1.2); // soft white light
scene.add(light);

// const pointLight = new PointLight(0xffffff, 1, 100);
// pointLight.position.set(10, 10, 10);
// scene.add(pointLight);

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

// const hookMesh = quickDraw.drawSphere(new Vector3(), 0x660000);
const hook = new MassPoint(Prealocator.getVector3());
const hook2 = new MassPoint(Prealocator.getVector3());
const hook3 = new MassPoint(Prealocator.getVector3());
const hook4 = new MassPoint(Prealocator.getVector3());


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
// scene.add(hookMesh);

let tempDeltaScaledVelocity = Prealocator.getVector3();
let tempDeltaScaledGravity = Prealocator.getVector3();

const solver = new CpuSolver(geometry, SIZE);
solver.setFloor(new Vector3(0, -4.9, 0));
solver.setHook(hook, 0);
// solver.setHook(hook2, SIZE - 1);
// solver.setHook(hook3, SIZE * SIZE - SIZE);
// solver.setHook(hook4, SIZE * SIZE - 2);
solver.setupConstraints();

const update = (dt: number, time: number) => {
  controls.update();


  hook.nextPosition.set(
    Math.cos(time / 500) * -50 + 0,
    Math.sin(time / 1000) * -20 + 30,
    Math.sin(time / 500) * -50 + 0,
  );

  // hook2.nextPosition.set(
  //   Math.cos(time / 1000) * -20,
  //   40,
  //   Math.sin(time / 1000) * 20,
  // );
  // hook3.nextPosition.set(
  //   -10,
  //   15,
  //   10
  // );
  // hook4.nextPosition.set(
  //   -10,
  //   15,
  //   -10
  // );

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
  // solver.hook.update();

  for (let i in pointsMeshes) {
    pointsMeshes[i].position.copy(solver.massPoints[i].position);
  }
  // hookMesh.position.copy(hook.position);

  geometry.normalsNeedUpdate = true;
  geometry.verticesNeedUpdate = true;
};

const render: UpdateFunctionType = (dt: number, time: number) => {
  renderer.render(scene, camera);
};

add(update, true);
add(render, false);
