import { FacesNeighbourType } from "./Topology/FacesNeighbourIterator";
import { QuickDraw } from "./debug/quickDraw";
import Chunks from "./Topology/Chunks";
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
import DistanceConstraint from "./constraints/DistanceConstraint";
import Constraint from "./constraints/Constraint";
import BendingConstraint from "./constraints/BendingConstraint";
import Topology from "./Topology/index";

const GRAVITY_FORCE = new Vector3(0, -4, 0);

const SIZE: number = 30;

const ITERATIONS = 15;

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
var light = new AmbientLight(0x000066, 0.8); // soft white light
scene.add(light);

const pointLight = new PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Meshes
const geometry = new PlaneGeometry(6, 6, SIZE - 1, SIZE - 1);

const material = new MeshLambertMaterial({
  color: 0xffffff,
  wireframe: false,
  side: DoubleSide
});

const cube = new Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);

// mouse
// let mousePosition = new Vector3(0, 0, 0);
// const mouseGeometry = new SphereGeometry(0.1);
// const mouseMesh = new Mesh(mouseGeometry, material);
// const mouse = new MassPoint(mouseMesh.position);
// scene.add(mouseMesh);

// hook
// const hookGeometry = new SphereGeometry(0.2);
// const hookMesh = new Mesh(hookGeometry, QuickDraw);
const hookMesh = quickDraw.drawSphere(new Vector3(), 0x660000);
const hook = new MassPoint(hookMesh.position);

// physic
const massPoints: Array<MassPoint> = geometry.vertices.map(
  v => new MassPoint(v)
);

// some debugging spheres on vertices
const pointsMeshes = massPoints.map(
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

// Topology
const topology = new Topology(geometry);
const constraints: Array<Constraint> = [];

for (let i = 0; i < massPoints.length; i++) {
  if (
    !massPoints[i] ||
    !massPoints[i + 1] ||
    !massPoints[i + SIZE] ||
    !massPoints[i + SIZE + 1]
  ) {
    continue;
  }
  constraints.push(
    new BendingConstraint(
      massPoints[i + SIZE],
      massPoints[i + 1],
      massPoints[i],
      massPoints[i + SIZE + 1],
      0,
      calcIterationalStiffness(0.9)
    )
  );
}

// continue with constraints

for (let { a, b, c } of topology.faces) {
  constraints.push(
    new DistanceConstraint(
      massPoints[a],
      massPoints[b],
      massPoints[b].position.distanceTo(massPoints[a].position),
      calcIterationalStiffness(1)
    )
  );
  constraints.push(
    new DistanceConstraint(
      massPoints[b],
      massPoints[c],
      massPoints[b].position.distanceTo(massPoints[c].position),
      calcIterationalStiffness(1)
    )
  );
  constraints.push(
    new DistanceConstraint(
      massPoints[c],
      massPoints[a],
      massPoints[c].position.distanceTo(massPoints[a].position),
      calcIterationalStiffness(1)
    )
  );
}

// mouse distance constraint to first point
hook.position.copy(massPoints[0].position);
constraints.push(new DistanceConstraint(massPoints[0], hook, 0, 1));
massPoints.push(hook);

let tempDeltaScaledVelocity = new Vector3();
let tempDeltaScaledGravity = new Vector3();

const constraintsLength = constraints.length;
const update = (dt: number, time: number) => {
  hook.position.set(
    200 * Math.sin(time / 500),
    SIZE * 2 + 50 * Math.cos(time / 500),
    20 * Math.cos(time / 500)
  );

  log(hook.position);

  controls.update();

  tempDeltaScaledGravity.copy(GRAVITY_FORCE).multiplyScalar(dt);

  for (let massPoint of massPoints) {
    massPoint.velocity.add(tempDeltaScaledGravity);
    massPoint.velocity.multiplyScalar(0.9);

    tempDeltaScaledVelocity.copy(massPoint.velocity);
    massPoint.nextPosition.addVectors(
      massPoint.position,
      tempDeltaScaledVelocity
    );
  }

  for (let i = 0; i < ITERATIONS; i++) {
    for (let i = 0; i < constraintsLength; i++) {
      constraints[i].solve();
    }
  }

  for (let massPoint of massPoints) {
    massPoint.update();
  }

  for (let i in pointsMeshes) {
    pointsMeshes[i].position.copy(massPoints[i].position);
  }

  geometry.normalsNeedUpdate = true;
  geometry.verticesNeedUpdate = true;
};

const render: UpdateFunctionType = (dt: number, time: number) => {
  renderer.render(scene, camera);
};

add(update, true);
add(render, false);

// const updateMousePosition = ({
//   clientX,
//   clientY
// }: {
//   clientX: number;
//   clientY: number;
// }) => {
//   mousePosition.set(
//     100 - clientX / window.innerWidth * 200,
//     100 - clientY / window.innerHeight * 200,
//     10
//   );

//   // mousePosition.unproject(camera);
//   // const dir = mousePosition.sub(camera.position).normalize();

//   // const distance = -camera.position.z / dir.z;
//   // const targetPosition = camera.position
//   //   .clone()
//   //   .add(dir.multiplyScalar(distance))
//   //   .applyQuaternion(camera.quaternion);
//   // mousePosition.copy(
//   //   new Vector3(-targetPosition.x, targetPosition.y, -targetPosition.z)
//   // );
// };
// renderer.domElement.addEventListener("mousemove", updateMousePosition);
