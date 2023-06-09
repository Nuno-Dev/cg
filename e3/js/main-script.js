// Variáveis globais
let scene, camera, renderer;
let fieldTexture, skyTexture;
let currentTexture;
let heightmapTexture, heightMapData, terrain, material_terrain;
let moon,
  moonLit = false;
let ambientLight, directionalLight, spotLight;
let house, tree, ovni, skydome;
let tree_array = [];
let scene_objects = [];
const raioEsfera = 100;
const segmentosEsfera = 64;
const aneisEsfera = 64;
let ovni_rotationSpeed = 0.005;
let ovni_movement = 0.1;
let ovniLights = [];
let lightStates;
let terrainIsLoaded = false;
let objectsCreated = false;
let leftArrowPressed = false;
let rightArrowPressed = false;
let upArrowPressed = false;
let downArrowPressed = false;
let currentKey = "";
let updateMaterial = false;
let currentMaterialType;
let controls;
let chimney,
  house_position_x,
  house_position_y,
  house_position_z,
  particleSystem;

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  "use strict";
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.xr.enabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(VRButton.createButton(renderer));
  createScene();
  loadTextures();
  createLighting();
  createCamera();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onResize);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableKeys = false;
  let button = document.getElementById("VRButton");
  button.addEventListener("click", function () {
    controls.dispose();
  });
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";
  update();
  render();
  renderer.setAnimationLoop(animate);
}

////////////
/* RENDER */
////////////

function render() {
  renderer.render(scene, camera);
}

////////////
/* UPDATE */
////////////

function update() {
  "use strict";
  if (terrainIsLoaded && !objectsCreated) {
    createObjects();
    objectsCreated = true;
  }
  if (objectsCreated) {
    rotateOvni();
    moveOvni();
    updateChimneySmoke();
    handleKeyboardInput();
  }
}

////////////////////////////
/*       HANDLERS         */
////////////////////////////

function handleKeyboardInput() {
  if (currentKey) {
    switch (currentKey) {
      case "1":
        createFieldTexture();
        createTerrain();
        break;
      case "2":
        createSkyTexture();
        createSkydome();
        break;
      case "D":
      case "d":
        directionalLight.visible = !directionalLight.visible;
        break;
      case "S":
      case "s":
        spotLight.visible = !spotLight.visible;
        break;
      case "P":
      case "p":
        lightStates = lightStates.map(function (state) {
          return !state;
        });
        for (let i = 0; i < ovniLights.length; i++) {
          ovniLights[i].visible = !ovniLights[i].visible;
        }
        break;
      case "ArrowLeft":
        leftArrowPressed = true;
        break;
      case "ArrowRight":
        rightArrowPressed = true;
        break;
      case "ArrowUp":
        upArrowPressed = true;
        break;
      case "ArrowDown":
        downArrowPressed = true;
        break;
      case "q":
      case "Q":
        currentMaterialType = "lambert";
        updateMaterial = true;
        break;
      case "w":
      case "W":
        currentMaterialType = "phong";
        updateMaterial = true;
        break;
      case "e":
      case "E":
        currentMaterialType = "toon";
        updateMaterial = true;
        break;
      case "r":
      case "R":
        currentMaterialType = "basic";
        updateMaterial = true;
        break;
    }
    currentKey = "";
    if (updateMaterial) {
      updateSceneObjectsMaterial();
    }
  }
}

function onKeyDown(e) {
  currentKey = e.key;
}

function onKeyUp(e) {
  currentKey = "";
  ("use strict");
  switch (e.key) {
    case "ArrowLeft":
      leftArrowPressed = false;
      break;
    case "ArrowRight":
      rightArrowPressed = false;
      break;
    case "ArrowUp":
      upArrowPressed = false;
      break;
    case "ArrowDown":
      downArrowPressed = false;
      break;
  }
}

function onResize() {
  "use strict";
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    const aspectRatio = window.innerWidth / window.innerHeight;
    cameraPerspectiva.aspect = aspectRatio;
    cameraPerspectiva.updateProjectionMatrix();
  }
}

////////////////////////////
/*       TEXTURE LOADER   */
////////////////////////////

function loadTextures() {
  let loader = new THREE.TextureLoader();
  let localImageUrl = "images/heightmap.jpg";
  let remoteImageUrl = "https://i.imgur.com/DLYhm6v.jpg";

  loader.load(
    localImageUrl,
    function (texture) {
      heightmapTexture = texture;
      heightMapData = getHeightMapData(heightmapTexture.image);
      createTerrain();
      terrainIsLoaded = true;
    },
    undefined,
    function (error) {
      loader.load(remoteImageUrl, function (texture) {
        heightmapTexture = texture;
        heightMapData = getHeightMapData(heightmapTexture.image);
        createTerrain();
        terrainIsLoaded = true;
      });
    }
  );

  createSkydome();
}

function getHeightMapData(img) {
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
    data[i / 4] = pix[i] / 4.5;
  }

  return data;
}

function createFieldTexture() {
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

function createTerrain() {
  let geometry = new THREE.PlaneBufferGeometry(50, 50, 256, 256);
  let positionArray = geometry.attributes.position.array;
  for (let i = 0; i < positionArray.length; i += 3) {
    positionArray[i + 2] = heightMapData[i / 3] * 0.1;
  }
  geometry.computeVertexNormals();
  geometry.rotateX(-Math.PI / 2);
  geometry.rotateY(Math.PI / 3);
  material_terrain = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
  if (currentTexture == fieldTexture) {
    material_terrain.map = currentTexture;
  }
  terrain = new THREE.Mesh(geometry, material_terrain);
  terrain.receiveShadow = true;

  scene.add(terrain);
}

function getTerrainHeight(x, z, width) {
  const X = Math.floor((x + 15) * 10);
  const Z = Math.floor((z + 15) * 10);

  const pos = Z * width + X;
  return heightMapData[pos] * 0.1;
}

function updateSceneObjectsMaterial() {
  for (let i = 0; i < scene_objects.length; i++) {
    let object = scene_objects[i];
    if (object instanceof THREE.Mesh) {
      let color = object.material.color;
      let emissive = object.material.emissive;
      let side = object.material.side;
      let map = object.material.map;
      let transparent = object.material.transparent;
      let opacity = object.material.opacity;
      switch (currentMaterialType) {
        case "lambert":
          object.material = new THREE.MeshLambertMaterial({
            ...(color && { color }),
            ...(emissive && { emissive }),
            ...(side && { side }),
            ...(map && { map }),
            ...(opacity && { opacity }),
            ...(transparent && { transparent }),
          });
          break;
        case "phong":
          object.material = new THREE.MeshPhongMaterial({
            ...(color && { color }),
            ...(emissive && { emissive }),
            ...(side && { side }),
            ...(map && { map }),
            ...(opacity && { opacity }),
            ...(transparent && { transparent }),
          });
          break;
        case "toon":
          object.material = new THREE.MeshToonMaterial({
            ...(color && { color }),
            ...(emissive && { emissive }),
            ...(side && { side }),
            ...(map && { map }),
            ...(opacity && { opacity }),
            ...(transparent && { transparent }),
          });
          break;
        case "basic":
          object.material = new THREE.MeshBasicMaterial({
            ...(color && { color }),
            ...(emissive && { emissive }),
            ...(side && { side }),
            ...(map && { map }),
            ...(opacity && { opacity }),
            ...(transparent && { transparent }),
          });
          break;
      }
    }
  }
  updateMaterial = false;
}

////////////////////////////
/*       SCENE & OBJECTS  */
////////////////////////////

function createScene() {
  scene = new THREE.Scene();
  scene.position.set(0, -10, -10);
  scene.position.y = -10;
}

function createCamera() {
  cameraPerspectiva = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  cameraPerspectiva.position.set(-5, 2, 10);
  camera = cameraPerspectiva;
}

function createObjects() {
  createMoon();
  createHouse();
  generateMultipleTrees();
  createOvni();
}

function createHouse() {
  house = new THREE.Group();
  house_position_x = 8;
  house_position_z = -2;

  const houseHeight = 5;
  const houseHalfHeight = houseHeight / 2;

  house_position_y =
    getTerrainHeight(
      house_position_x,
      house_position_z,
      heightmapTexture.image.width
    ) +
    houseHalfHeight / 2;

  // Wall vertices and indices
  let wallPoints = [
    [-6.0, -1.5, 2], // Point 0
    [3.0, -1.5, 2], // Point 1
    [3.0, 1, 2], // Point 2
    [-6.0, 1, 2], // Point 3
    [-6.0, -1.5, -2], // Point 4
    [3.0, -1.5, -2], // Point 5
    [3.0, 1, -2], // Point 6
    [-6.0, 1, -2], // Point 7
    [-6.0, 2.0, 0], // Point 8: New point at (-6, 3, 0)
    [3.0, 2.0, 0], // Point 9: New point at (3, 3, 0)
  ];

  let wallTriangles = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 4, 8],
    [0, 8, 3],
    [4, 8, 7],
    [4, 5, 7],
    [5, 6, 7],
    [5, 6, 9],
    [1, 2, 9],
    [1, 9, 5],
    [3, 2, 8],
    [2, 8, 9],
    [6, 7, 9],
    [7, 9, 8],
  ];

  let wallVertices = new Float32Array(wallPoints.flat());
  let wallIndices = new Uint32Array(wallTriangles.flat());

  let wallGeometry = new THREE.BufferGeometry();
  wallGeometry
    .setAttribute("position", new THREE.BufferAttribute(wallVertices, 3))
    .setIndex(new THREE.BufferAttribute(wallIndices, 1))
    .computeVertexNormals();

  // Door vertices and indices
  let doorPoints = [
    [-0.35, -1.5, 2.01], // Point 1
    [0.25, -1.5, 2.01], // Point 2
    [0.25, 0.0, 2.01], // Point 3
    [-0.35, 0.0, 2.01], // Point 4
  ];
  let doorTriangles = [
    [0, 1, 2], // Triangle 1
    [0, 2, 3], // Triangle 2
  ];
  let doorVertices = new Float32Array(doorPoints.flat());
  let doorIndices = new Uint32Array(doorTriangles.flat());
  let doorGeometry = new THREE.BufferGeometry();
  doorGeometry
    .setAttribute("position", new THREE.BufferAttribute(doorVertices, 3))
    .setIndex(new THREE.BufferAttribute(doorIndices, 1))
    .computeVertexNormals();

  // Window vertices and indices
  let windowPoints = [
    [-0.5, -0.25, 2.01], // Point 1
    [0.5, -0.25, 2.01], // Point 2
    [0.5, 0.75, 2.01], // Point 3
    [-0.5, 0.75, 2.01], // Point 4
  ];
  let windowTriangles = [
    [0, 1, 2], // Triangle 1
    [0, 2, 3], // Triangle 2
  ];
  let windowVertices = new Float32Array(windowPoints.flat());
  let windowIndices = new Uint32Array(windowTriangles.flat());

  let windowGeometry = new THREE.BufferGeometry();
  windowGeometry
    .setAttribute("position", new THREE.BufferAttribute(windowVertices, 3))
    .setIndex(new THREE.BufferAttribute(windowIndices, 1))
    .computeVertexNormals();

  let roofPoints = [
    [-6.0, 1.1, 2], // Point 0
    [3.0, 1.1, 2], // Point 1
    [3.0, 2.1, 0], // Point 2
    [-6.0, 2.1, 0], // Point 3
    [-6.0, 1.1, -2], // Point 4
    [3.0, 1.1, -2], // Point 5
  ];

  let roofTriangles = [
    [0, 1, 2], // Triangle 1
    [0, 2, 3], // Triangle 2
    [2, 5, 4],
    [4, 3, 2],
  ];
  let roofVertices = new Float32Array(roofPoints.flat());
  let roofIndices = new Uint32Array(roofTriangles.flat());

  let roofGeometry = new THREE.BufferGeometry();
  roofGeometry
    .setAttribute("position", new THREE.BufferAttribute(roofVertices, 3))
    .setIndex(new THREE.BufferAttribute(roofIndices, 1))
    .computeVertexNormals();
  const chimneyFrontWidth = 0.4;
  let chimneyPoints = [
    [chimneyFrontWidth, 2.5, 0.3], // Point 1
    [0.9, 2.5, 0.3], // Point 2
    [0.9, 4.5, 0.3], // Point 3
    [chimneyFrontWidth, 4.5, 0.3], // Point 4
    [chimneyFrontWidth, 2.5, -0.3], // Point 5
    [0.9, 2.5, -0.3], // Point 6
    [0.9, 4.5, -0.3], // Point 7
    [chimneyFrontWidth, 4.5, -0.3], // Point 8
  ];

  let chimneyTriangles = [
    [0, 1, 2], // Front face - Triangle 1
    [0, 2, 3], // Front face - Triangle 2
    [4, 5, 6], // Back face - Triangle 3
    [4, 6, 7], // Back face - Triangle 4
    [4, 0, 3], // Left face - Triangle 5
    [4, 3, 7], // Left face - Triangle 6
    [5, 1, 2], // Right face - Triangle 7
    [5, 2, 6], // Right face - Triangle 8
    [2, 3, 7], // Top face - Triangle 9
    [2, 7, 6], // Top face - Triangle 10
    [0, 1, 5], // Bottom face - Triangle 11
    [0, 5, 4], // Bottom face - Triangle 12
  ];
  let chimneyVertices = new Float32Array(chimneyPoints.flat());
  let chimneyIndices = new Uint32Array(chimneyTriangles.flat());
  let chimneyGeometry = new THREE.BufferGeometry();
  chimneyGeometry
    .setAttribute("position", new THREE.BufferAttribute(chimneyVertices, 3))
    .setIndex(new THREE.BufferAttribute(chimneyIndices, 1))
    .computeVertexNormals();

  const wallMaterial = new THREE.MeshToonMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const roofMaterial = new THREE.MeshToonMaterial({ color: 0xffa500 });
  const doorMaterial = new THREE.MeshToonMaterial({ color: 0x00008b });
  const windowMaterial = new THREE.MeshToonMaterial({ color: 0x00008b });
  const chimneyMaterial = new THREE.MeshToonMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
  });

  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  const windowOne = new THREE.Mesh(windowGeometry, windowMaterial);
  const windowTwo = new THREE.Mesh(windowGeometry, windowMaterial);
  const windowThree = new THREE.Mesh(windowGeometry, windowMaterial);
  chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);

  door.position.x = -0.5;
  windowOne.position.x = -4.5;
  windowTwo.position.x = 1;
  windowThree.position.x = -2.5;
  chimney.position.set(0.5, -1.5, 0.8);

  house.add(wall);
  house.add(roof);
  house.add(door);
  house.add(windowOne);
  house.add(windowTwo);
  house.add(windowThree);
  createChimneySmoke();

  house.add(chimney);
  house.position.set(house_position_x, house_position_y, house_position_z);
  house.rotation.y = -Math.PI / 2 + 0.05;
  scene.add(house);
  scene_objects.push(
    wall,
    roof,
    door,
    windowOne,
    windowTwo,
    windowThree,
    chimney
  );
}

function createMoon() {
  let geometry = new THREE.SphereGeometry(2, 32, 32);
  let material = new THREE.MeshPhongMaterial({ emissive: 0xfff244 });
  moon = new THREE.Mesh(geometry, material);
  moon.position.set(8, 20, -7);
  scene.add(moon);
  scene_objects.push(moon);
}

function createSkydome() {
  if (skydome) {
    scene.remove(skydome);
  }
  let hemisphereGeometry = new THREE.SphereGeometry(
    25,
    32,
    32,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const material = new THREE.MeshPhongMaterial({
    map: skyTexture,
    side: THREE.BackSide,
  });

  skydome = new THREE.Mesh(hemisphereGeometry, material);
  skydome.position.set(0, 1.4, 0);
  scene.add(skydome);
}

function createLighting() {
  ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffcc, 0.7);
  directionalLight.position.set(8, 20, -7);
  directionalLight.visible = false;
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
}

function createTree() {
  const tree = new THREE.Group();
  const trunkHeight = Math.random() * (0.7 - 0.4) + 0.4;
  const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, trunkHeight);
  const branchGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
  const branchMaterial = new THREE.MeshToonMaterial({ color: 0xcd853f });

  const trunk = new THREE.Mesh(trunkGeometry, branchMaterial);
  const mainBranch = new THREE.Mesh(branchGeometry, branchMaterial);
  const secondBranch = new THREE.Mesh(branchGeometry, branchMaterial);
  trunk.position.y = 1;

  mainBranch.position.y = 1.5;
  mainBranch.position.x = 0.3;
  mainBranch.rotation.z = -Math.PI / 5;
  secondBranch.position.x = -0.3;
  secondBranch.position.y = 1.5;
  secondBranch.rotation.z = Math.PI / 5;

  const radiusX = 0.7;
  const radiusY = 0.5;
  const radiusZ = 0.8;
  const widthSegments = 20;
  const heightSegments = 20;

  const ellipsoidGeometry = new THREE.SphereGeometry(
    radiusX,
    widthSegments,
    heightSegments
  );
  ellipsoidGeometry.scale(radiusX, radiusY, radiusZ);

  const ellipsoidMaterial = new THREE.MeshToonMaterial({ color: 0x003300 });

  const canopy1 = new THREE.Mesh(ellipsoidGeometry, ellipsoidMaterial);
  canopy1.position.set(0.7, 2, -0.15);
  const canopy2 = new THREE.Mesh(ellipsoidGeometry, ellipsoidMaterial);
  canopy2.position.set(-0.7, 2, -0.15);
  const canopy3 = new THREE.Mesh(ellipsoidGeometry, ellipsoidMaterial);
  canopy3.position.set(0, 2.4, -0.15);

  trunk.castShadow = true;
  mainBranch.castShadow = true;
  secondBranch.castShadow = true;
  canopy1.castShadow = true;
  canopy2.castShadow = true;
  canopy3.castShadow = true;

  tree.add(trunk);
  tree.add(mainBranch);
  tree.add(secondBranch);
  tree.add(canopy1);
  tree.add(canopy2);
  tree.add(canopy3);
  scene_objects.push(
    trunk,
    mainBranch,
    secondBranch,
    canopy1,
    canopy2,
    canopy3
  );

  return tree;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function generateMultipleTrees() {
  const terrain_width = 20;
  const tree_count = 35;
  for (let i = 0; i < tree_count; i++) {
    const tree = createTree();

    let x, z;
    let validPosition;
    do {
      x = getRandomArbitrary(-terrain_width, terrain_width);
      z = getRandomArbitrary(-terrain_width, terrain_width);

      validPosition =
        (z >= 5 && x <= 0) || x <= -2 || z >= 5 || x >= 10 || z <= -10;
      for (let j = 0; j < tree_array.length; j++) {
        const existingTree = tree_array[j];
        const distance = tree.position.distanceTo(existingTree.position);
        if (distance < 2) {
          validPosition = false;
          break;
        }
      }
    } while (!validPosition);

    const y = getTerrainHeight(x, z, 50);

    tree.position.set(x, y, z);
    tree.rotation.y = Math.random() * Math.PI * 2;

    scene.add(tree);
    tree_array.push(tree);
  }
}

function createOvni() {
  ovni = new THREE.Group();

  let bodyGeometry = new THREE.SphereGeometry(5, 32, 16);
  bodyGeometry.scale(1, 0.4, 1);
  let bodyMaterial = new THREE.MeshToonMaterial({ color: 0x000000 });
  let body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  ovni.add(body);

  let cockpitGeometry = new THREE.SphereGeometry(
    3,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  let cockpitMaterial = new THREE.MeshToonMaterial({ color: 0x808080 });
  let cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  ovni.add(cockpit);

  let lightColor = 0xffffff;
  let cylinderGeometry = new THREE.CylinderGeometry(1, 1, 4, 8);
  let cylinderMaterial = new THREE.MeshToonMaterial({
    color: lightColor,
    transparent: true,
    opacity: 0.5,
  });
  let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.y = -1;
  ovni.add(cylinder);

  let lightSphereMaterial = new THREE.MeshToonMaterial({
    color: lightColor,
    transparent: true,
    opacity: 1,
  });
  let lightIntensity = 2;
  for (let i = 0; i < 12; i++) {
    let light = new THREE.PointLight(0xffa500, lightIntensity, 1.5);
    let lightSphereGeometry = new THREE.SphereGeometry(0.2);
    let lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    let theta = i * ((Math.PI * 2) / 12);
    lightSphere.position.set(
      3 * Math.cos(theta),
      -4 * 0.4,
      3 * Math.sin(theta)
    );
    ovni.add(lightSphere);
    scene_objects.push(lightSphere);
    light.target = lightSphere;
    lightSphere.add(light);
    ovniLights.push(light);
  }
  lightStates = new Array(ovniLights.length).fill(true);

  spotLight = new THREE.SpotLight(0xffa500, 1, 0, Math.PI / 12);
  let spotLightTarget = new THREE.Object3D();
  spotLightTarget.position.copy(terrain.position);
  cylinder.add(spotLightTarget);
  spotLight.target = spotLightTarget;
  spotLight.castShadow = true;
  cylinder.add(spotLight);

  ovni.scale.set(0.25, 0.25, 0.25);
  ovni.position.set(-2, 9.5, 6);

  scene.add(ovni);
  scene_objects.push(body, cockpit, cylinder);
}

function moveOvni() {
  if (upArrowPressed && rightArrowPressed) {
    ovni.position.z -= ovni_movement;
    ovni.position.x += ovni_movement;
  } else if (upArrowPressed && leftArrowPressed) {
    ovni.position.z -= ovni_movement;
    ovni.position.x -= ovni_movement;
  } else if (downArrowPressed && rightArrowPressed) {
    ovni.position.z += ovni_movement;
    ovni.position.x += ovni_movement;
  } else if (downArrowPressed && leftArrowPressed) {
    ovni.position.z += ovni_movement;
    ovni.position.x -= ovni_movement;
  } else if (upArrowPressed) {
    ovni.position.z -= ovni_movement;
  } else if (downArrowPressed) {
    ovni.position.z += ovni_movement;
  } else if (leftArrowPressed) {
    ovni.position.x -= ovni_movement;
  } else if (rightArrowPressed) {
    ovni.position.x += ovni_movement;
  }
}

function rotateOvni() {
  ovni.rotation.y += ovni_rotationSpeed;
}

function createChimneySmoke() {
  let particleCount = 5;
  let particles = new THREE.BufferGeometry();
  let positions = [];
  let particleObjects = [];

  let pMaterial = new THREE.PointsMaterial({
    color: 0xcccccc,
    size: 0.2,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  for (let p = 0; p < particleCount; p++) {
    let particle = new SmokeParticle();
    particleObjects.push(particle);
    positions.push(
      particle.position.x,
      particle.position.y,
      particle.position.z
    );
  }

  particles.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  particleSystem = new THREE.Points(particles, pMaterial);
  particleSystem.name = "smoke";
  particleSystem.userData.particleObjects = particleObjects;
  chimney.add(particleSystem);
}

function updateChimneySmoke() {
  let particleSystem = scene.getObjectByName("smoke");
  if (particleSystem) {
    let particleSystem = scene.getObjectByName("smoke");

    let positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < positions.length / 3; i++) {
      let particle = particleSystem.userData.particleObjects[i];
      particle.update(0.2);
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
  }
}

class SmokeParticle {
  constructor() {
    this.position = chimney.position.clone();
    this.position.y = 4.3;
    this.position.z -= 0.7 + Math.random() * 0.2 - 0.1;
    this.position.x += 0.2 + Math.random() * 0.2 - 0.1;
    this.velocity = new THREE.Vector3(0, Math.random() * 0.02, 0);
  }

  update(delta) {
    this.position.add(this.velocity.clone().multiplyScalar(delta));

    if (this.position.y > 5.4) {
      this.position.y = 4.3;
    }
  }
}
