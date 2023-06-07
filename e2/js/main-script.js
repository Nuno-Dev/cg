//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let animating = false;
let collisionRecoil = 0.4;
let trailerBox;
let robotBox;
var cameraFrontal,
  cameraLateral,
  cameraTopo,
  cameraOrtogonal,
  cameraPerspectiva,
  scene,
  renderer;
var geometry, material, mesh;
var robot, cube, camera, head, trailer, cintura;
var trailerPosition = new THREE.Vector3(0, 0, -10); // Posição inicial do trailer
var trailerSpeed = 0.1; // Velocidade de movimento do trailer
var wireframeValue = false;
var minRotationX_foot = 0;
var maxRotationX_foot = Math.PI / 2;
var maxRotationX_cintura = Math.PI / 2;
var minRotationX_cintura = 0;
var angleFoot = 0;
var angleCintura = 0;
var maxRotationX_Head = 0;
var minRotationX_Head = -(Math.PI-Math.PI/12);
var angleHead = 0;
let left_sub_leg, right_sub_leg;
var pivot = new THREE.Object3D();

var trailer_wheels = [];


const robot_body_width = 1.3;
const robot_body_height = 1.4;
const robot_body_depth = 0.9;
const robot_cintura_width = 1;

const robot_head_width = 0.5;
const robot_head_height = 0.5;
const robot_head_depth = 0.5;

const eyeSize = robot_head_height / 6;

const earWidth = 0.1;
const earHeight = 0.5;
const earDepth = 0.1;

const robot_arm_width = 0.3;
const robot_arm_height = 0.75;
const robot_arm_depth = 0.3;

const robot_sub_arm_width = 0.3;
const robot_sub_arm_height = 1.05;
const robot_sub_arm_depth = 0.3;

const robot_sub_leg_width = 0.225;
const robot_sub_leg_height = 0.5;
const robot_sub_leg_depth = 0.225;

const robot_leg_width = 0.4;
const robot_leg_height = 1.3;
const robot_leg_depth = 0.4;

const robot_foot_width = 0.45;
const robot_foot_height = 0.3;
const robot_foot_depth = 0.525;


const robot_arm_color = 0x919911;
const robot_leg_color = 0x119911;
const robot_foot_color = 0x771177;
const robot_body_color = 0x000000;
const robot_head_color = 0x521312;
const robot_sub_arm_color = 0x919fff;
const robot_sub_leg_color = 0x119911;

const trailer_position_x = -1;
const trailer_position_y = -(
  robot_body_height / 2 +
  robot_leg_height / 1.5 -
  robot_foot_height
);
const trailer_position_z = 0;
const trailer_body_width = 5;
const trailer_body_height = 2;
const trailer_body_depth = 2;
const trailer_wheel_radius = 0.5;
const trailer_wheel_thickness = 0.2;
const trailer_body_color = 0x000000;
const trailer_wheel_color = 0xff0000;

// Initialize key state variables
let leftArrowPressed = false;
let rightArrowPressed = false;
let upArrowPressed = false;
let downArrowPressed = false;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  "use strict";
  scene = new THREE.Scene();
  scene.add(new THREE.AxisHelper(10));
  scene.background = new THREE.Color("#ADD8E6");
  createtrailer();
  createRobot();
  trailerBox = new THREE.Box3().setFromObject(trailer);
  robotBox = new THREE.Box3().setFromObject(robot);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
  "use strict";
  const ortographic_camera_size = 10;
  const perspective_camera_size = 5;
  cameraFrontal = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 100);
  cameraFrontal.position.set(0, 0, ortographic_camera_size);
  cameraFrontal.lookAt(scene.position);

  cameraLateral = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 100);
  cameraLateral.position.set(ortographic_camera_size, 0, 0);
  cameraLateral.lookAt(scene.position);

  cameraTopo = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 100);
  cameraTopo.position.set(0, ortographic_camera_size, 0);
  cameraTopo.lookAt(scene.position);

  // Câmera de projeção ortogonal para visualizar toda a cena
  cameraOrtogonal = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 100);
  cameraOrtogonal.position.set(0, 0, ortographic_camera_size * 2);
  cameraOrtogonal.lookAt(scene.position);

  // Câmera de projeção perspectiva para visualizar toda a cena
  cameraPerspectiva = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  cameraPerspectiva.position.set(
    perspective_camera_size * 2,
    perspective_camera_size * 2,
    perspective_camera_size * 2
  );
  cameraPerspectiva.lookAt(scene.position);
  camera = cameraPerspectiva;

  // Adiciona as câmeras à cena
  scene.add(cameraFrontal);
  scene.add(cameraLateral);
  scene.add(cameraTopo);
  scene.add(cameraOrtogonal);
  scene.add(cameraPerspectiva);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createtrailer() {
  trailer = new THREE.Object3D();
  geometry = new THREE.BoxGeometry(
    trailer_body_width,
    trailer_body_height,
    trailer_body_depth
  );
  material = new THREE.MeshBasicMaterial({ color: trailer_body_color });
  let trailer_body = new THREE.Mesh(geometry, material);
  trailer_body.position.set(
    trailer_position_x,
    trailer_position_y,
    trailer_position_z
  );
  trailer.add(trailer_body);

  // Adicionar peça de ligacao
  const newCubeGeometry = new THREE.BoxGeometry(2, 0.5, 0.5);
  const newCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
  const newCube = new THREE.Mesh(newCubeGeometry, newCubeMaterial);

  // Set the position of the new cube relative to the trailer's origin
  newCube.position.set(
    trailer_position_x - trailer_body_width / 2,
    trailer_position_y,
    trailer_position_z
  );
  trailer.add(newCube); // Add the new cube to the trailer object

  // add trailer_wheels at relative positions
  addWheel();
  addWheel();
  addWheel();
  addWheel();
  updateWheelsPosition();
  // rotate trailer to point in the Z positive direction
  trailer.rotation.y = Math.PI / 2;
}

function addWheel() {
  const wheel_radius = 0.4;
  const wheel_thickness = 0.5;

  geometry = new THREE.CylinderGeometry(
    wheel_radius,
    wheel_radius,
    wheel_thickness,
    32
  );
  material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  wheel = new THREE.Mesh(geometry, material);
  wheel.rotation.x = Math.PI / 2; // rotate the cylinder to lie horizontally
  trailer_wheels.push(wheel); // add the wheel to the array
  trailer.add(wheel);
  scene.add(trailer);
}

function updateWheelsPosition() {
  // update the position of the trailer_wheels
  trailer_wheels[0].position.set(
    trailer_position_x,
    trailer_position_y - trailer_body_height / 2,
    trailer_position_z + trailer_body_depth / 2
  );
  trailer_wheels[1].position.set(
    trailer_position_x,
    trailer_position_y - trailer_body_height / 2,
    trailer_position_z - trailer_body_depth / 2
  );
  trailer_wheels[2].position.set(
    trailer_position_x + trailer_body_width / 3,
    trailer_position_y - trailer_body_height / 2,
    trailer_position_z + trailer_body_depth / 2
  );
  trailer_wheels[3].position.set(
    trailer_position_x + trailer_body_width / 3,
    trailer_position_y - trailer_body_height / 2,
    trailer_position_z - trailer_body_depth / 2
  );
}

////////////////////////
/* CREATE ROBOT */
////////////////////////
function createRobot() {
  //body
  robot = new THREE.Object3D();
  geometry = new THREE.BoxGeometry(
    robot_body_width,
    robot_body_height,
    robot_body_depth
  );
  material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cintura = new THREE.Mesh(geometry, material);
  cintura.position.set(0, 0, 0);
  robot.add(cintura);

  //head
  geometry = new THREE.BoxGeometry(
    robot_head_width,
    robot_head_height,
    robot_head_depth
  );
  material = new THREE.MeshBasicMaterial({ color: 0x919911 });
  pivot.position.set(0,robot_body_height/2 - robot_head_height/2,0);
  head = new THREE.Mesh(geometry, material);
  head.position.set(0,  robot_head_height / 2, 0);
  pivot.add(head);

  // Eyes
  material = new THREE.MeshBasicMaterial({ color: 0x000000 }); // black eyes
  geometry = new THREE.BoxGeometry(eyeSize, eyeSize, eyeSize);
  let leftEye = new THREE.Mesh(geometry, material);
  let rightEye = new THREE.Mesh(geometry, material);

  // Position eyes on the face of the head
  leftEye.position.set(
    -robot_head_width / 4,
    robot_head_height / 4,
    robot_head_depth / 2 + eyeSize / 2
  );
  rightEye.position.set(
    robot_head_width / 4,
    robot_head_height / 4,
    robot_head_depth / 2 + eyeSize / 2
  );
  // Add eyes to head
  head.add(leftEye);
  head.add(rightEye);

  // Ears
  let earMaterial = new THREE.MeshBasicMaterial({ color: 0x772812 }); // same color as head
  let earGeometry = new THREE.BoxGeometry(earWidth, earHeight, earDepth);
  let leftEar = new THREE.Mesh(earGeometry, earMaterial);
  let rightEar = new THREE.Mesh(earGeometry, earMaterial);

  // Position ears on the sides of the head
  leftEar.position.set(-robot_head_width / 2 - earWidth / 2, 0.2, 0);
  rightEar.position.set(robot_head_width / 2 + earWidth / 2, 0.2, 0);

  // Add ears to head
  head.add(leftEar);
  head.add(rightEar);
  
 
  //left arm
  left_arm = new THREE.Object3D();

  geometry = new THREE.BoxGeometry(
    robot_arm_width,
    robot_arm_height,
    robot_arm_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_arm_color });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(
    -robot_body_width / 2 - robot_arm_width / 2,
    robot_body_height / 2 - robot_arm_height / 2,
    0
  );
  left_arm.add(cube);

  //left sub arm
  geometry = new THREE.BoxGeometry(
    robot_sub_arm_width,
    robot_sub_arm_height,
    robot_sub_arm_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_sub_arm_color });
  cube = new THREE.Mesh(geometry, material);
  //rotational point

  cube.position.set(
    -robot_body_width / 2 - robot_arm_width / 2,
    robot_body_height / 2 - robot_arm_height - robot_sub_arm_height / 2,
    0
  );
  left_arm.add(cube);
  robot.add(left_arm);

  //right arm

  rigth_arm = new THREE.Object3D();

  geometry = new THREE.BoxGeometry(
    robot_arm_width,
    robot_arm_height,
    robot_arm_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_arm_color }); // color red
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(
    robot_body_width / 2 + robot_arm_width / 2,
    robot_body_height / 2 - robot_arm_height / 2,
    0
  );
  rigth_arm.add(cube);

  //right sub arm
  geometry = new THREE.BoxGeometry(
    robot_sub_arm_width,
    robot_sub_arm_height,
    robot_sub_arm_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_sub_arm_color });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(
    robot_body_width / 2 + robot_arm_width / 2,
    robot_body_height / 2 - robot_arm_height - robot_sub_arm_height / 2,
    0
  );
  rigth_arm.add(cube);

  robot.add(rigth_arm);

  left_leg = new THREE.Object3D();

  //left sub leg
  geometry = new THREE.BoxGeometry(
    robot_sub_leg_width,
    robot_sub_leg_height,
    robot_sub_leg_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_sub_leg_color });
  left_sub_leg = new THREE.Mesh(geometry, material);
  left_sub_leg.position.set(
    robot_cintura_width / 2 - robot_sub_leg_width/2,
    -(robot_body_height / 2 + robot_sub_leg_height / 2),
    0
  );
  left_leg.add(left_sub_leg);

  //left leg
  geometry = new THREE.BoxGeometry(
    robot_leg_width,
    robot_leg_height,
    robot_leg_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_leg_color });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(
    robot_body_width / 2 - robot_leg_width / 1.6,
    -(robot_body_height / 2 + robot_leg_height / 2 + robot_sub_leg_height),
    0
  );
  left_leg.add(cube);
  left_leg.position.set(0,-robot_head_height,0);

  //left foot
  geometry = new THREE.BoxGeometry(
    robot_foot_width,
    robot_foot_height,
    robot_foot_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_foot_color });
  left_foot = new THREE.Mesh(geometry, material);
  left_foot.position.set(
    robot_body_width / 2 - robot_leg_width / 1.6,
    -(
      robot_body_height / 2 +
      robot_leg_height +
      robot_foot_height / 2 +
      robot_sub_leg_height
    ),
    robot_foot_depth / 8
  );
  left_leg.add(left_foot);

  const cylinderRadius = 0.3; // Adjust the radius as desired
  const cylinderHeight = 0.3; // Adjust the height as desired
  let cylinderMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  });
  let cylinderGeometry = new THREE.CylinderGeometry(
    cylinderRadius,
    cylinderRadius,
    cylinderHeight
  );
  // Create the cylinders using the same material
  let cylinder1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  let cylinder2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  let cylinder3 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  let cylinder4 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

  cylinder1.position.set(
    left_sub_leg.position.x + robot_leg_width / 2,
    left_sub_leg.position.y - robot_leg_height / 2,
    left_sub_leg.position.z
  );
  cylinder1.rotation.set(0, 0, Math.PI / 2);

  cylinder2.position.set(
    left_sub_leg.position.x + robot_leg_width / 2,
    left_sub_leg.position.y - robot_leg_height / 1.02,
    left_sub_leg.position.z
  );
  cylinder2.rotation.set(0, 0, Math.PI / 2);

  left_leg.add(cylinder1);
  left_leg.add(cylinder2);

  right_leg = new THREE.Object3D();

  //right sub leg
  geometry = new THREE.BoxGeometry(
    robot_sub_leg_width,
    robot_sub_leg_height,
    robot_sub_leg_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_sub_leg_color });
  right_sub_leg = new THREE.Mesh(geometry, material);
  right_sub_leg.position.set(
    -robot_cintura_width / 2 + robot_sub_leg_width/2,
    -(robot_body_height / 2 + robot_sub_leg_height / 2),
    0
  );
  right_leg.add(right_sub_leg);

  cylinder3.position.set(
    right_sub_leg.position.x - robot_leg_width / 2,
    right_sub_leg.position.y - robot_leg_height / 2,
    right_sub_leg.position.z
  );
  cylinder3.rotation.set(0, 0, Math.PI / 2);

  cylinder4.position.set(
    right_sub_leg.position.x - robot_leg_width / 2,
    right_sub_leg.position.y - robot_leg_height / 1.02,
    right_sub_leg.position.z
  );
  cylinder4.rotation.set(0, 0, Math.PI / 2);

  right_leg.add(cylinder3);
  right_leg.add(cylinder4);

  //right leg
  geometry = new THREE.BoxGeometry(
    robot_leg_width,
    robot_leg_height,
    robot_leg_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_leg_color });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(
    -robot_body_width / 2 + robot_leg_width / 1.6,
    -(robot_body_height / 2 + robot_leg_height / 2 + robot_sub_leg_height),
    0
  );
  right_leg.add(cube);
  right_leg.position.set(0,-robot_head_height,0);

  //right foot
  geometry = new THREE.BoxGeometry(
    robot_foot_width,
    robot_foot_height,
    robot_foot_depth
  );
  material = new THREE.MeshBasicMaterial({ color: robot_foot_color });
  right_foot = new THREE.Mesh(geometry, material);
  right_foot.position.set(
    -robot_body_width / 2 + robot_leg_width / 1.7,
    -(
      robot_body_height / 2 +
      robot_leg_height +
      robot_foot_height / 2 +
      robot_sub_leg_height
    ),
    robot_foot_depth / 8
  );
  scene.add(pivot);
  var legs = new THREE.Object3D();
  legs.add(left_leg);
  legs.add(right_leg);
  pivot.add(legs);

  right_leg.add(right_foot);
  geometry = new THREE.BoxGeometry(
    robot_cintura_width,
    robot_head_height,
    robot_head_depth
  );
  material = new THREE.MeshBasicMaterial({ color: 0x919911 });
  cintura = new THREE.Mesh(geometry, material);
  cintura.position.set(0, -robot_body_height / 2, 0);
  cintura.add(legs);
  legs.position.set(0,robot_sub_leg_height+robot_head_height,0);
  
  let cylinder5 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  let cylinder6 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

  cylinder5.position.set(
    cintura.position.x + robot_cintura_width / 2,
    cintura.position.y + robot_cintura_width / 2,
    cintura.position.z
  );
  cylinder5.rotation.set(0, 0, Math.PI / 2);

  cylinder6.position.set(
    cintura.position.x - robot_cintura_width / 2,
    cintura.position.y + robot_cintura_width / 2,
    cintura.position.z
  );
  cylinder6.rotation.set(0, 0, Math.PI / 2);

cintura.add(cylinder5);
cintura.add(cylinder6);


  robot.add(cintura)
  scene.add(robot);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
  "use strict";
  if (trailerBox.intersectsBox(robotBox)) {
    console.log("Collision Detected!");
    // Handle the collision
    handleCollisions();
  } else {
    // If not colliding, reset animating
    animating = false;
  }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
  "use strict";
  if (upArrowPressed) {
    if (leftArrowPressed) {
      trailerPosition.x -= collisionRecoil;
      trailerPosition.z -= collisionRecoil;
    } else if (rightArrowPressed) {
      trailerPosition.x += collisionRecoil;
      trailerPosition.z -= collisionRecoil;
    } else {
      trailerPosition.z -= collisionRecoil;
    }
  } else if (downArrowPressed) {
    if (leftArrowPressed) {
      trailerPosition.x -= collisionRecoil;
      trailerPosition.z += collisionRecoil;
    } else if (rightArrowPressed) {
      trailerPosition.x += collisionRecoil;
      trailerPosition.z += collisionRecoil;
    } else {
      trailerPosition.z += collisionRecoil;
    }
  } else if (leftArrowPressed) {
    trailerPosition.x -= collisionRecoil;
  } else if (rightArrowPressed) {
    trailerPosition.x += collisionRecoil;
  }
}

////////////
/* UPDATE */
////////////
function update() {
  "use strict";
  robot.updateMatrixWorld();
  // Reposiciona o trailer de acordo com a posição atualizada
  trailer.position.copy(trailerPosition);
}

/////////////
/* DISPLAY */
/////////////
function render() {
  "use strict";
  update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  "use strict";
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createScene();
  createCameras();

  render();

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
  window.addEventListener("keyup", onKeyUp);
  animate();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";
  render();
  requestAnimationFrame(animate);
  update();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  "use strict";
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    const aspectRatio = window.innerWidth / window.innerHeight;

    cameraFrontal.left = -5 * aspectRatio;
    cameraFrontal.right = 5 * aspectRatio;
    cameraFrontal.top = 5;
    cameraFrontal.bottom = -5;
    cameraFrontal.updateProjectionMatrix();

    cameraLateral.left = -5;
    cameraLateral.right = 5;
    cameraLateral.top = 5;
    cameraLateral.bottom = -5;
    cameraLateral.updateProjectionMatrix();

    cameraTopo.left = -5 * aspectRatio;
    cameraTopo.right = 5 * aspectRatio;
    cameraTopo.top = 5;
    cameraTopo.bottom = -5;
    cameraTopo.updateProjectionMatrix();

    cameraOrtogonal.left = -10 * aspectRatio;
    cameraOrtogonal.right = 10 * aspectRatio;
    cameraOrtogonal.top = 10;
    cameraOrtogonal.bottom = -10;
    cameraOrtogonal.updateProjectionMatrix();

    cameraPerspectiva.aspect = aspectRatio;
    cameraPerspectiva.updateProjectionMatrix();
  }
  render();
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
  "use strict";
  if (animating) return;
  switch (e.keyCode) {
    case 49: // Tecla '1' - Câmera frontal
      camera = cameraFrontal;
      break;
    case 50: // Tecla '2' - Câmera lateral
      camera = cameraLateral;
      break;
    case 51: // Tecla '3' - Câmera topo
      camera = cameraTopo;
      break;
    case 52: // Tecla '4' - Câmera ortogonal
      camera = cameraOrtogonal;
      break;
    case 53: // Tecla '5' - Câmera perspectiva
      camera = cameraPerspectiva;
      break;
    case 54: // Tecla '6' - alternar entre modelo de arames e sólida
      wireframeValue = !wireframeValue;
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.material.wireframe = wireframeValue;
        }
      });

      break;
    case 37: // Tecla 'seta esquerda'
      leftArrowPressed = true;
      break;
    case 39: // Tecla 'seta direita'
      rightArrowPressed = true;
      break;
    case 38: // Tecla 'seta cima'
      upArrowPressed = true;
      break;
    case 40: // Tecla 'seta baixo'
      downArrowPressed = true;
      break;

    case 81: // 'Q'
    case 113: // 'q'
      right_foot.rotation.x = THREE.MathUtils.clamp(
        left_foot.rotation.x,
        minRotationX_foot,
        maxRotationX_foot
      );
      if (angleFoot + 0.1 < maxRotationX_foot) {
        left_foot.rotateX(0.1);
        right_foot.rotateX(0.1);
        angleFoot = angleFoot + 0.1;
      } else {
        left_foot.rotateX(maxRotationX_foot - angleFoot);
        right_foot.rotateX(maxRotationX_foot - angleFoot);
        angleFoot = maxRotationX_foot;
      }
      break;
    case 65: // 'A'
    case 97: // 'a'
      // Rotate foot revolution axis in negative direction
      right_foot.rotation.x = THREE.MathUtils.clamp(
        left_foot.rotation.x,
        minRotationX_foot,
        maxRotationX_foot
      );
      if (angleFoot - 0.1 > minRotationX_foot) {
        left_foot.rotateX(-0.1);
        right_foot.rotateX(-0.1);
        angleFoot = angleFoot - 0.1;
      } else {
        left_foot.rotateX(minRotationX_foot - angleFoot);
        right_foot.rotateX(minRotationX_foot - angleFoot);
        angleFoot = minRotationX_foot;
      }

      break;
    case 87: // 'W'
    case 119: // 'w'
      // Rotate waist revolution axis in positive direction
      right_foot.rotation.x = THREE.MathUtils.clamp(
        left_foot.rotation.x,
        minRotationX_cintura,
        maxRotationX_cintura
      );
      if (angleCintura + 0.1 < maxRotationX_cintura) {
        cintura.rotateX(0.1);
        angleCintura = angleCintura + 0.1;
      } else {
        cintura.rotateX(maxRotationX_cintura - angleCintura);
        angleCintura = maxRotationX_cintura;
      }

      break;
    case 83: // 'S'
    case 115: // 's'
      // Rotate waist revolution axis in negative direction
      cintura.rotation.x = THREE.MathUtils.clamp(
        cintura.rotation.x,
        minRotationX_cintura,
        maxRotationX_cintura
      );
      if (angleCintura - 0.1 > minRotationX_cintura) {
        cintura.rotateX(-0.1);
        angleCintura = angleCintura - 0.1;
      } else {
        cintura.rotateX(minRotationX_cintura - angleCintura);
        angleCintura = minRotationX_cintura;
      }
      break;
    case 69: // 'E'
    case 101: // 'e'
      // Translate upper limbs medially
      rigth_arm.position.x -= 0.1;
      left_arm.position.x += 0.1;
      break;
    case 68: // 'D'
    case 100: // 'd'
      // Translate upper limbs laterally
      rigth_arm.position.x += 0.1;
      left_arm.position.x -= 0.1;
      break;
    case 82: // 'R'
    case 114: // 'r'
      pivot.rotation.x = THREE.MathUtils.clamp(
      pivot.rotation.x,
      minRotationX_Head,
      maxRotationX_Head
    );
      if (angleHead+0.1 < maxRotationX_Head){
        pivot.rotateX(0.1);
        angleHead = angleHead + 0.1;
      }
      else{
        pivot.rotateX(maxRotationX_Head-angleHead);
        angleHead = maxRotationX_Head;
      }
      break;
    case 70: // 'F'
    case 102: // 'f'
      pivot.rotation.x = THREE.MathUtils.clamp(
      pivot.rotation.x,
      minRotationX_Head,
      maxRotationX_Head
    );
      if (angleHead-0.1 > minRotationX_Head){
        pivot.rotateX(-0.1);
        angleHead = angleHead - 0.1;
      }
      else{
        pivot.rotateX(minRotationX_Head-angleHead);
        angleHead = minRotationX_Head;
      }
      break;
    default:
      break;
  }
  movetrailer();
  robotBox.setFromObject(robot);
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
  "use strict";
  if (animating) return;
  switch (e.keyCode) {
    case 37: // Tecla 'seta esquerda'
      leftArrowPressed = false;
      break;
    case 39: // Tecla 'seta direita'
      rightArrowPressed = false;
      break;
    case 38: // Tecla 'seta cima'
      upArrowPressed = false;
      break;
    case 40: // Tecla 'seta baixo'
      downArrowPressed = false;
      break;
    case 114:
    case 82:
      shouldRotateHead = false;
      break;
    case 102:
    case 70:
      shouldRotateHead = false;
      break;
    default:
      break;
  }
  movetrailer();
}

function movetrailer() {
  if (leftArrowPressed) {
    trailerPosition.x += trailerSpeed; // move left
  }

  if (rightArrowPressed) {
    trailerPosition.x -= trailerSpeed; // move right
  }

  if (upArrowPressed) {
    if (leftArrowPressed) {
      trailerPosition.x += trailerSpeed / Math.sqrt(2); // move diagonally left and up
      trailerPosition.z += trailerSpeed / Math.sqrt(2);
    } else if (rightArrowPressed) {
      trailerPosition.x -= trailerSpeed / Math.sqrt(2); // move diagonally right and up
      trailerPosition.z += trailerSpeed / Math.sqrt(2);
    } else {
      trailerPosition.z += trailerSpeed; // move forward
    }
  }

  if (downArrowPressed) {
    if (leftArrowPressed) {
      trailerPosition.x += trailerSpeed / Math.sqrt(2); // move diagonally left and down
      trailerPosition.z -= trailerSpeed / Math.sqrt(2);
    } else if (rightArrowPressed) {
      trailerPosition.x -= trailerSpeed / Math.sqrt(2); // move diagonally right and down
      trailerPosition.z -= trailerSpeed / Math.sqrt(2);
    } else {
      trailerPosition.z -= trailerSpeed; // move forward
    }
  }
  trailerBox.setFromObject(trailer);
  // Check for collision
  checkCollisions();
}
