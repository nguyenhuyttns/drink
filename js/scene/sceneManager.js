/* ============================================================================
 * TRÌNH QUẢN LÝ THREE.JS SCENE (SCENE MANAGER)
 * Khởi tạo Scene, Camera, Renderer, Lights, OrbitControls và sự kiện Resize.
 * ============================================================================ */

let scene, camera, renderer, controls;
let clock = new THREE.Clock();

function init3DScene() {
    const container = document.getElementById('canvas-container');

    // 1. Scene & Fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff0f5);
    scene.fog = new THREE.Fog(0xfff0f5, 18, 38);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(6.5, 7.2, 8.5);

    // 3. Renderer với PCF Soft Shadow
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0.5);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Ngăn camera chui xuống dưới sàn
    controls.minDistance = 3.5;
    controls.maxDistance = 18;
    controls.update();

    // 5. Hệ thống Chiếu Sáng (Lighting)
    const hemiLight = new THREE.HemisphereLight(0xfff8fa, 0xfce7f3, 0.85);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 0.75);
    dirLight.position.set(7, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    const d = 8.5;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Sự kiện resize màn hình
    window.addEventListener('resize', onWindowResize);

    return { scene, camera, renderer, controls, clock };
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
