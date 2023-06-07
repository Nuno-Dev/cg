// Variáveis globais
let scene, camera, renderer;
let fieldTexture, skyTexture;
let currentTexture = 0;
let terrainTexture, heightmapTexture, heightData, terrain, material_terrain;
let moon,
  moonLit = false;
let ambientLight, directionalLight;
let house, tree, ovni, skydome;
let tree_array = [];
const raioEsfera = 50;
const segmentosEsfera = 64;
const aneisEsfera = 64;
let ovni_rotationSpeed = 0.005;
let ovni_movement = 0.05;
let ovniLights = [];
let lightStates;
let keyState = {};

let leftArrowPressed = false;
let rightArrowPressed = false;
let upArrowPressed = false;
let downArrowPressed = false;
let animating = false;
// Função para criar a cena
function createScene() {
  scene = new THREE.Scene();
  createSkydome();
}

// Função para criar a câmera
function createCamera() {
  const pos_multiplier = 1;
  cameraPerspectiva = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  cameraPerspectiva.position.set(5 * pos_multiplier, 10, 20 * pos_multiplier);
  cameraPerspectiva.lookAt(0, 5, 0);
  camera = cameraPerspectiva;
}

// Função para criar objetos 3D
function createObjects() {
  createMoon();
  createHouse();
  generateMultipleTrees();
  createOvni();
  moveOvni();
  rotateOvni();
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
  loadTextures();
  createLighting();
  createCamera();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onResize);
  animate();
}

function onKeyDown(e) {
  switch (e.keyCode) {
    case 49: // Tecla '1' - Câmera frontal
      createFieldTexture();
      createTerrain();
      break;
    case 50: // Tecla '2' - Câmera lateral
      createSkyTexture();
      createSkydome();
      break;
    case 80: // Tecla 'p' - Câmera frontal
      lightStates = lightStates.map(function (state) {
        return !state; // Inverter o estado
      });
      for (let i = 0; i < ovniLights.length; i++) {
        if (ovniLights[i].visible == true) {
          ovniLights[i].visible = false;
        } else {
          ovniLights[i].visible = true;
        }
      }
      break;
    case 16: // Tecla 'P' - Câmera frontal
      lightStates = lightStates.map(function (state) {
        return !state; // Inverter o estado
      });
      for (let i = 0; i < ovniLights.length; i++) {
        if (ovniLights[i].visible == true) {
          ovniLights[i].visible = false;
        } else {
          ovniLights[i].visible = true;
        }
      }
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
  }
}

function onKeyUp(e) {
  "use strict";
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
  }
}

function moveOvni() {
  if (upArrowPressed && rightArrowPressed) {
    ovni.position.z -= Math.sqrt(ovni_movement) / 2;
    ovni.position.x += Math.sqrt(ovni_movement) / 2;
  } else if (upArrowPressed && leftArrowPressed) {
    ovni.position.z -= Math.sqrt(ovni_movement) / 2;
    ovni.position.x -= Math.sqrt(ovni_movement) / 2;
  } else if (downArrowPressed && rightArrowPressed) {
    ovni.position.z += Math.sqrt(ovni_movement) / 2;
    ovni.position.x += Math.sqrt(ovni_movement) / 2;
  } else if (downArrowPressed && leftArrowPressed) {
    ovni.position.z += Math.sqrt(ovni_movement) / 2;
    ovni.position.x -= Math.sqrt(ovni_movement) / 2;
  } else if (upArrowPressed) {
    ovni.position.z -= ovni_movement;
  } else if (downArrowPressed) {
    ovni.position.z += ovni_movement;
  } else if (leftArrowPressed) {
    ovni.position.x -= ovni_movement;
  } else if (rightArrowPressed) {
    ovni.position.x += ovni_movement;
  }
  requestAnimationFrame(moveOvni);
}

function rotateOvni() {
  ovni.rotation.y += ovni_rotationSpeed;
  requestAnimationFrame(rotateOvni);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  "use strict";
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    const aspectRatio = window.innerWidth / window.innerHeight;
    cameraPerspectiva.aspect = aspectRatio;
    cameraPerspectiva.updateProjectionMatrix();
  }
}

function getHeightData(img) {
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  let context = canvas.getContext("2d");

  let size = img.width * img.height;
  let data = new Float32Array(size);

  context.drawImage(img, 0, 0);

  let imgd = context.getImageData(0, 0, img.width, img.height);
  let pix = imgd.data;

  for (let i = 0; i < pix.length; i += 4) {
    data[i / 4] = pix[i] / 5;
  }

  return data;
}

function loadTextures() {
  let loader = new THREE.TextureLoader();
  let localImageUrl = "images/heightmap.jpg";
  let remoteImageUrl = "https://i.imgur.com/QMi5CEu.jpg";

  loader.load(
    localImageUrl,
    function (texture) {
      // If the local image loads successfully
      heightmapTexture = texture;
      heightData = getHeightData(heightmapTexture.image);
      createTerrain();
      createObjects();
    },
    undefined,
    function (error) {
      // If the local image fails to load, try the remote image
      loader.load(remoteImageUrl, function (texture) {
        heightmapTexture = texture;
        heightData = getHeightData(heightmapTexture.image);
        createTerrain();
        createObjects();
      });
    }
  );
}

function createHouse() {
  house = new THREE.Group();
  const house_position_x = 6;
  const house_position_z = -2;

  const houseHeight = 5;
  const houseHalfHeight = houseHeight / 2;

  const house_position_y =
    getTerrainHeight(
      house_position_x,
      house_position_z,
      heightmapTexture.image.width,
      heightData
    ) + houseHalfHeight;

  // Cria as formas geométricas para a casa
  const wallGeometry = new THREE.BoxGeometry(3, 3, 3);
  const roofGeometry = new THREE.ConeGeometry(2.3, 2, 4);
  const doorGeometry = new THREE.BoxGeometry(0.5, 1, 0.01);
  const windowGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.01);

  // Cria o material para as formas
  const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  const roofMaterial = new THREE.MeshBasicMaterial({ color: 0x663300 });
  const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x663300 });
  const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xadd8e6 });

  // Cria as malhas para a casa
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
  const windowRight = new THREE.Mesh(windowGeometry, windowMaterial);

  // Posiciona as partes da casa
  roof.rotation.y = Math.PI / 3.5;
  roof.position.y = 2.6;
  door.position.y = -0.8;
  door.position.z = 2;
  windowLeft.position.y = windowRight.position.y = 0.8;
  windowLeft.position.z = windowRight.position.z = 2.1;
  windowLeft.position.x = -0.4;
  windowRight.position.x = 0.7;

  // Adiciona as partes da casa ao grupo
  house.add(wall);
  house.add(roof);
  house.add(door);
  house.add(windowLeft);
  house.add(windowRight);
  house.position.set(house_position_x, house_position_y, house_position_z);
  scene.add(house);
}

// Create the geometry using heightmap and texture
function createTerrain() {
  let geometry = new THREE.PlaneBufferGeometry(20, 20, 256, 256);

  let positionArray = geometry.attributes.position.array;
  for (let i = 0; i < positionArray.length; i += 3) {
    positionArray[i + 2] = heightData[i / 3] * 0.1;
  }

  geometry.attributes.position.needsUpdate = true; // inform three.js that the vertices have changed
  geometry.rotateX(-Math.PI / 2); // Rotate the geometry so it lies in the xOz plane
  material_terrain = new THREE.MeshBasicMaterial({ map: terrainTexture });
  terrain = new THREE.Mesh(geometry, material_terrain);
  if (currentTexture == fieldTexture) {
    createFieldTexture();
    currentTexture.repeat.set(2, 2);
    currentTexture.wrapS = THREE.RepeatWrapping;
    currentTexture.wrapT = THREE.RepeatWrapping;
    material_terrain.map = currentTexture;
    terrain = new THREE.Mesh(geometry, material_terrain);
  }

  scene.add(terrain);
}

function createFieldTexture() {
  // Textura do campo floral
  const fieldCanvas = document.createElement("canvas");
  fieldCanvas.width = 512;
  fieldCanvas.height = 512;
  const fieldContext = fieldCanvas.getContext("2d");
  fieldContext.fillStyle = "lightgreen";
  fieldContext.fillRect(0, 0, 512, 512);
  const colors = ["white", "yellow", "magenta", "lightblue"];
  for (let i = 0; i < 500; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    fieldContext.fillStyle = color;
    const x = Math.random() * fieldCanvas.width;
    const y = Math.random() * fieldCanvas.height;
    const radius = Math.random() * 3;
    fieldContext.beginPath();
    fieldContext.arc(x, y, radius, 0, Math.PI * 2);
    fieldContext.fill();
  }
  fieldTexture = new THREE.CanvasTexture(fieldCanvas);
  currentTexture = fieldTexture;
}

function createSkyTexture() {
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 512;
  skyCanvas.height = 512;
  const skyContext = skyCanvas.getContext("2d");
  const gradient = skyContext.createLinearGradient(0, 0, 0, skyCanvas.height);
  gradient.addColorStop(0, "darkblue");
  gradient.addColorStop(1, "darkviolet");
  skyContext.fillStyle = gradient;
  skyContext.fillRect(0, 0, 512, 512);
  skyContext.fillStyle = "white";
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * skyCanvas.width;
    const y = Math.random() * skyCanvas.height;
    const radius = Math.random() * 2;
    skyContext.beginPath();
    skyContext.arc(x, y, radius, 0, Math.PI * 2);
    skyContext.fill();
  }
  skyTexture = new THREE.CanvasTexture(skyCanvas);
  currentTexture = skyTexture;
}

function createMoon() {
  let geometry = new THREE.SphereGeometry(1, 32, 32);
  let material = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
  moon = new THREE.Mesh(geometry, material);
  moon.position.set(0, 14, 0);

  scene.add(moon);
}

function createSkydome() {
  let esferaGeometry = new THREE.SphereGeometry(
    15,
    32,
    32,
    -0.1,
    Math.PI * 1.1
  );
  const material = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide,
  });
  // Criar a esfera
  skydome = new THREE.Mesh(esferaGeometry, material);

  skydome.position.set(0, 1, 0);
  skydome.rotation.x = -Math.PI / 2 - 0.1;
  scene.add(skydome);
}

function createLighting() {
  ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, -10, 0).normalize();
  directionalLight.visible = true;
  scene.add(directionalLight);
}

function createTree() {
  const tree = new THREE.Group();
  const canopy_y = 2.4;

  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, canopy_y);
  const branchGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
  const barkMaterial = new THREE.MeshBasicMaterial({ color: 0xcd853f }); // castanho-alaranjado

  const trunk = new THREE.Mesh(trunkGeometry, barkMaterial);
  const mainBranch = new THREE.Mesh(branchGeometry, barkMaterial);

  trunk.position.y = 1;

  mainBranch.position.y = 1.5;
  mainBranch.position.x = 0.4;
  mainBranch.rotation.z = -Math.PI / 5;

  const canopyGeometry = new THREE.SphereGeometry(0.5, 20, 20);
  const canopyMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 }); // verde-escuro

  const canopy1 = new THREE.Mesh(canopyGeometry, canopyMaterial);
  canopy1.position.set(0.5, canopy_y, 0);

  const canopy2 = new THREE.Mesh(canopyGeometry, canopyMaterial);
  canopy2.position.set(-0.5, canopy_y, 0);

  const canopy3 = new THREE.Mesh(canopyGeometry, canopyMaterial);
  canopy3.position.set(0, canopy_y, 0.3);

  tree.add(trunk);
  tree.add(mainBranch);
  tree.add(canopy1);
  tree.add(canopy2);
  tree.add(canopy3);

  return tree;
}

function getRandomArbitrary(min, max, favoredMin, favoredMax) {
  let num;
  if (Math.random() < 2 / 3) {
    num = Math.random() * (favoredMax - favoredMin) + favoredMin;
  } else {
    if (Math.random() < 0.5) {
      num = Math.random() * (favoredMin - min) + min;
    } else {
      num = Math.random() * (max - favoredMax) + favoredMax;
    }
  }
  return num;
}

function generateMultipleTrees() {
  const terrain_width = 9;
  const tree_count = 10;
  for (let i = 0; i < tree_count; i++) {
    const tree = createTree();

    let x, z;
    let overlapping;
    do {
      x = getRandomArbitrary(-terrain_width, terrain_width, -6, terrain_width);
      z = getRandomArbitrary(-terrain_width, terrain_width, -6, terrain_width);

      overlapping = false;
      // Check for overlap with existing trees
      for (let j = 0; j < tree_array.length; j++) {
        const existingTree = tree_array[j];
        const distance = tree.position.distanceTo(existingTree.position);
        if (distance < 1) {
          overlapping = true;
          break;
        }
      }
      // Check for being too close to the house
      const distanceToHouse = tree.position.distanceTo(house.position);
      if (distanceToHouse < 3) {
        overlapping = true;
      }
    } while (overlapping);

    const y = getTerrainHeight(x, z, 50);

    tree.position.set(x, y, z);
    tree.scale.y = Math.random() * 0.5 + 0.75;
    tree.rotation.y = Math.random() * Math.PI * 2;

    scene.add(tree);
    tree_array.push(tree);
  }
}

function getTerrainHeight(x, z, width) {
  const X = Math.floor((x + 15) * 10);
  const Z = Math.floor((z + 15) * 10);

  const pos = Z * width + X;
  return heightData[pos] * 0.1;
}

function createOvni() {
  ovni = new THREE.Group();

  // Corpo do OVNI (esfera achatada)
  let bodyGeometry = new THREE.SphereGeometry(5, 32, 16);
  bodyGeometry.scale(1, 0.4, 1);
  let bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  let body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  ovni.add(body);

  // Cockpit (calote esférica)
  let cockpitGeometry = new THREE.SphereGeometry(
    3,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  let cockpitMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
  let cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  ovni.add(cockpit);

  // Cilindro achatado na parte de baixo
  let lightColor = 0xffffff;
  let cylinderGeometry = new THREE.CylinderGeometry(1, 1, 4, 8);
  let cylinderMaterial = new THREE.MeshPhongMaterial({
    color: lightColor,
    transparent: true,
    opacity: 0.5,
  });
  let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.y = -1;
  ovni.add(cylinder);

  // Luzes pontuais nas pequenas esferas
  // Lights

  let lightSphereMaterial = new THREE.MeshPhongMaterial({
    color: lightColor,
    transparent: true, // Habilita a transparência
    opacity: 1, // Define a opacidade das esferas (0 = totalmente transparente, 1 = totalmente opaco)
  });
  let lightIntensity = 10;
  for (let i = 0; i < 12; i++) {
    let light = new THREE.PointLight(0xffa500, lightIntensity);
    let lightSphereGeometry = new THREE.SphereGeometry(0.2);
    let lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    let theta = i * ((Math.PI * 2) / 12); // equally distribute lights
    lightSphere.position.set(
      3 * Math.cos(theta),
      -4 * 0.4,
      3 * Math.sin(theta)
    );
    light.position.copy(lightSphere.position);
    ovni.add(lightSphere);
    lightSphere.add(light);
    ovniLights.push(light);
  }
  lightStates = new Array(ovniLights.length).fill(true);

  let spotLight = new THREE.SpotLight(0xffa500, 1, 0, Math.PI / 6);
  spotLight.position.copy(cylinder.position);
  let spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.copy(terrain.position); // Definir a posição do chão como alvo
  cylinder.add(spotLightTarget);
  spotLight.target = spotLightTarget;
  cylinder.add(spotLight);
  scene.add(spotLight);

  // Movement and rotation
  ovni.userData = {
    moveLeft: false,
    moveRight: false,
    rotate: true,
    lightsOn: true,
    spotlightOn: true,
  };
  // Adjust the scale and position
  ovni.scale.set(0.25, 0.25, 0.25);
  ovni.position.y = 9;
  ovni.position.z = 6;
  scene.add(ovni);
}
