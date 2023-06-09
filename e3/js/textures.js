// Variáveis globais

let scene, camera, renderer;
let fieldTexture, skyTexture;
let currentTexture = 'field';
// Função para criar a cena
function createScene() {
    scene = new THREE.Scene();
    createFieldTexture();
    addTexture();
    
}

// Função para criar a câmera
function createCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
}

// Função para criar as luzes
function createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 3, 5);
    scene.add(pointLight);
}

// Função para criar objetos 3D
function createFieldTexture() {
  // Textura do campo floral
  const fieldCanvas = document.createElement('canvas');
  fieldCanvas.width = 512;
  fieldCanvas.height = 512;
  const fieldContext = fieldCanvas.getContext('2d');
  fieldContext.fillStyle = 'lightgreen';
  fieldContext.fillRect(0, 0, 512, 512);
  const colors = ['white', 'yellow', 'magenta', 'lightblue'];
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
  return fieldTexture;
}
  
function createSkyTexture(){
    // Textura do céu estrelado
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512;
  skyCanvas.height = 512;
  const skyContext = skyCanvas.getContext('2d');
  const gradient = skyContext.createLinearGradient(0, 0, 0, skyCanvas.height);
  gradient.addColorStop(0, 'darkblue');
  gradient.addColorStop(1, 'darkviolet');
  skyContext.fillStyle = gradient;
  skyContext.fillRect(0, 0, 512, 512);
  skyContext.fillStyle = 'white';
  for (let i = 0; i < 300; i++) {
      const x = Math.random() * skyCanvas.width;
      const y = Math.random() * skyCanvas.height;
      const radius = Math.random() * 2;
      skyContext.beginPath();
      skyContext.arc(x, y, radius, 0, Math.PI * 2);
      skyContext.fill();
  }
  skyTexture = new THREE.CanvasTexture(skyCanvas);
  return skyTexture;
  }
  
function addTexture(){
 // Adicionar o objeto inicial à cena
  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  let planeMaterial;
  if (currentTexture === 'field') {
      planeMaterial = new THREE.MeshBasicMaterial({ map: fieldTexture });
  } else if (currentTexture === 'sky') {
    planeMaterial = new THREE.MeshBasicMaterial({
        map: skyTexture,
        vertexColors: THREE.VertexColors,
      });
  }
  
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.name = 'plane';
  scene.add(plane);
  }


function update() {
    "use strict";
    
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
    createCamera();
    document.addEventListener('keydown', onKeyDown, false);
    render();
  
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
  
function onKeyDown(e) {
    if (e.key === '1') {
        currentTexture = 'field';
        createFieldTexture();
        const planeMaterial = new THREE.MeshBasicMaterial({ map: fieldTexture });
        scene.getObjectByName('plane').material = planeMaterial;
    } else if (e.key === '2') {
        currentTexture = 'sky';
        createSkyTexture();
        const planeMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });
        scene.getObjectByName('plane').material = planeMaterial;
    }
}

