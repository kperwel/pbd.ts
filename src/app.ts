import 'three/examples/js/controls/TrackballControls';
import { Scene, PerspectiveCamera, WebGLRenderer, Vector3 } from 'three';
import {
  BoxGeometry,
  PlaneGeometry,
  SphereGeometry,
  Mesh,
  MeshBasicMaterial,
  TrackballControls,
} from 'three';
import { PointLight } from 'three';

import { add, remove, UpdateFunctionType } from './time/loop';
import MassPoint from './MassPoint';
import DistanceConstraint from './constraints/DistanceConstraint';
import Constraint from './constraints/Constraint';

const ITERATIONS = 10;

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.z = -10;

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
const pointLight = new PointLight(0xff0000, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Meshes
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const cube = new Mesh(geometry, material);
cube.position.set(0, 2, 0);
scene.add(cube);

// Plane
const floorGeometry = new PlaneGeometry(6, 6, 0, 0);
const floor = new Mesh(floorGeometry, material);
floor.rotateX(-90);
floor.position.set(0, -1, 0);
scene.add(floor);

// mouse
let mousePosition = new Vector3(0, 0, 0);
const mouseGeometry = new SphereGeometry(0.1);
const mouseMesh = new Mesh(mouseGeometry, material);
const mouse = new MassPoint(mouseMesh.position);
scene.add(mouseMesh);

// physic
const massPoints: Array<MassPoint> = geometry.vertices.map(
  v => new MassPoint(v),
);

const constraints: Array<Constraint> = [];
for (let { a, b, c } of geometry.faces) {
  constraints.push(new DistanceConstraint(massPoints[a], massPoints[b]));
  constraints.push(new DistanceConstraint(massPoints[b], massPoints[c]));
  constraints.push(new DistanceConstraint(massPoints[c], massPoints[a]));
}
constraints.push(new DistanceConstraint(massPoints[0], mouse, 0, 1));
massPoints.push(mouse);

const update = (dt: number, time: number) => {
  mouse.position.copy(mousePosition);
  controls.update();

  for (let massPoint of massPoints) {
    massPoint.velocity.add(new Vector3(0, -100 * dt, 0));
    massPoint.velocity.multiplyScalar(0.9);
    massPoint.nextPosition.addVectors(
      massPoint.position,
      massPoint.velocity.clone().multiplyScalar(dt),
    );
  }
  for (let i = 0; i < ITERATIONS; i++) {
    for (let constraint of constraints) {
      constraint.solve();
    }
  }

  for (let massPoint of massPoints) {
    massPoint.update();
  }

  geometry.verticesNeedUpdate = true;
};

const render: UpdateFunctionType = (dt: number, time: number) => {
  renderer.render(scene, camera);
};

add(update, true);
add(render, false);

const updateMousePosition = ({
  clientX,
  clientY,
}: {
  clientX: number;
  clientY: number;
}) => {
  mousePosition.set(
    clientX / window.innerWidth * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1,
    0.5,
  );

  mousePosition.unproject(camera);
  const dir = mousePosition.sub(camera.position).normalize();

  const distance = -camera.position.z / dir.z;
  mousePosition.copy(camera.position.clone().add(dir.multiplyScalar(distance)));
};
renderer.domElement.addEventListener('mousemove', updateMousePosition);
