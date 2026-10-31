/* ============================================================================
 * MÔ HÌNH BÉ MÈO CƯNG 3D & TƯƠNG TÁC VUỐT VE (PET CAT 3D ENGINE)
 * Chú mèo vàng Chibi 3D nằm ngủ trên nệm quầy bar, kêu Meow~ và nhả tiền may mắn.
 * ============================================================================ */

let petCatGroup = null;
let petCatHitbox = null;
let catTailMesh = null;
let catHeadGroup = null;
let catBodyMesh = null;
let catFigureGroup = null;

let catJumpTimer = 0;
let lastCatRewardTime = 0;

/**
 * Khởi tạo mô hình 3D Chibi Cat trên mặt quầy bar
 * @param {THREE.Scene} targetScene 
 */
function buildPetCat3D(targetScene) {
    petCatGroup = new THREE.Group();
    // Vị trí đặt trên mặt quầy (giữa ly trà sữa và máy tính tiền)
    petCatGroup.position.set(0.45, 1.44, -0.35);

    // 1. CHIẾC NỆM TRÒN PASTEL HỒNG (Cushion)
    const cushionGeo = new THREE.CylinderGeometry(0.36, 0.40, 0.09, 24);
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
    cushionMesh.position.y = 0.045;
    cushionMesh.receiveShadow = true;
    cushionMesh.castShadow = true;
    petCatGroup.add(cushionMesh);

    // Viền ren trắng quanh nệm
    const ringGeo = new THREE.TorusGeometry(0.38, 0.025, 8, 24);
    const ringMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.055;
    petCatGroup.add(ringMesh);

    // 2. KHỐI CƠ THỂ BÉ MÈO VÀNG CHIBI (Figure Group)
    catFigureGroup = new THREE.Group();
    catFigureGroup.position.y = 0.09;

    const furMat = new THREE.MeshLambertMaterial({ color: 0xfb923c }); // Màu lông vàng cam ấm áp
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Bụng & chân trắng
    const pinkMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 }); // Lòng tai hồng

    // Thân tròn ú nu
    const bodyGeo = new THREE.SphereGeometry(0.19, 18, 14);
    catBodyMesh = new THREE.Mesh(bodyGeo, furMat);
    catBodyMesh.scale.set(1.25, 0.88, 0.95);
    catBodyMesh.position.set(-0.04, 0.12, 0);
    catBodyMesh.castShadow = true;
    catFigureGroup.add(catBodyMesh);

    // Đốm bụng trắng
    const bellyGeo = new THREE.SphereGeometry(0.14, 14, 12);
    const bellyMesh = new THREE.Mesh(bellyGeo, whiteMat);
    bellyMesh.scale.set(1.0, 0.75, 0.55);
    bellyMesh.position.set(-0.02, 0.10, 0.11);
    catFigureGroup.add(bellyMesh);

    // 3. ĐẦU MÈO CHIBI & GƯƠNG MẶT
    catHeadGroup = new THREE.Group();
    catHeadGroup.position.set(0.16, 0.20, 0.03);

    const headGeo = new THREE.SphereGeometry(0.16, 18, 16);
    const headMesh = new THREE.Mesh(headGeo, furMat);
    headMesh.scale.set(1.1, 0.95, 1.05);
    headMesh.castShadow = true;
    catHeadGroup.add(headMesh);

    // Hai tai nhọn hình nón
    [-0.07, 0.07].forEach((offsetZ, i) => {
        const earGeo = new THREE.ConeGeometry(0.065, 0.13, 5);
        const ear = new THREE.Mesh(earGeo, furMat);
        ear.position.set(0.02, 0.16, offsetZ);
        ear.rotation.x = i === 0 ? -0.2 : 0.2;
        ear.rotation.z = -0.15;
        catHeadGroup.add(ear);

        // Lòng tai hồng
        const innerEar = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 4), pinkMat);
        innerEar.position.set(0.03, 0.15, offsetZ);
        innerEar.rotation.x = ear.rotation.x;
        innerEar.rotation.z = ear.rotation.z;
        catHeadGroup.add(innerEar);
    });

    // MẶT MÈO: Canvas Texture vẽ mắt nhắm ngủ hạnh phúc & ria mép cute
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 256;
    faceCanvas.height = 256;
    const fCtx = faceCanvas.getContext('2d');

    fCtx.clearRect(0, 0, 256, 256);

    // Đôi mắt cười tít (^ ^)
    fCtx.strokeStyle = '#431407';
    fCtx.lineWidth = 7;
    fCtx.lineCap = 'round';

    // Mắt trái
    fCtx.beginPath();
    fCtx.arc(95, 120, 18, Math.PI * 1.15, Math.PI * 1.85);
    fCtx.stroke();

    // Mắt phải
    fCtx.beginPath();
    fCtx.arc(161, 120, 18, Math.PI * 1.15, Math.PI * 1.85);
    fCtx.stroke();

    // Chiếc mũi hồng tam giác
    fCtx.fillStyle = '#f472b6';
    fCtx.beginPath();
    fCtx.moveTo(128, 138);
    fCtx.lineTo(121, 130);
    fCtx.lineTo(135, 130);
    fCtx.closePath();
    fCtx.fill();

    // Miệng cười :3
    fCtx.strokeStyle = '#431407';
    fCtx.lineWidth = 5;
    fCtx.beginPath();
    fCtx.arc(122, 142, 7, 0.2 * Math.PI, 0.9 * Math.PI);
    fCtx.stroke();
    fCtx.beginPath();
    fCtx.arc(134, 142, 7, 0.1 * Math.PI, 0.8 * Math.PI);
    fCtx.stroke();

    // Má hồng baby
    fCtx.fillStyle = 'rgba(244, 114, 182, 0.55)';
    fCtx.beginPath();
    fCtx.arc(75, 140, 14, 0, Math.PI * 2);
    fCtx.arc(181, 140, 14, 0, Math.PI * 2);
    fCtx.fill();

    // Ria mép trắng tinh nghịch
    fCtx.strokeStyle = '#ffffff';
    fCtx.lineWidth = 4;
    // Ria trái
    fCtx.beginPath();
    fCtx.moveTo(65, 132); fCtx.lineTo(35, 126);
    fCtx.moveTo(65, 142); fCtx.lineTo(32, 145);
    fCtx.stroke();
    // Ria phải
    fCtx.beginPath();
    fCtx.moveTo(191, 132); fCtx.lineTo(221, 126);
    fCtx.moveTo(191, 142); fCtx.lineTo(224, 145);
    fCtx.stroke();

    const faceTex = new THREE.CanvasTexture(faceCanvas);
    const faceOverlay = new THREE.Mesh(
        new THREE.PlaneGeometry(0.24, 0.24),
        new THREE.MeshBasicMaterial({ map: faceTex, transparent: true })
    );
    faceOverlay.position.set(0.165, 0.02, 0);
    faceOverlay.rotation.y = Math.PI / 2;
    catHeadGroup.add(faceOverlay);

    catFigureGroup.add(catHeadGroup);

    // 4. BỐN BÀN CHÂN TRẮNG TRÒN TRĨNH
    const pawGeo = new THREE.SphereGeometry(0.045, 12, 10);
    [
        { x: 0.12, y: 0.02, z: 0.08 },
        { x: 0.12, y: 0.02, z: -0.08 },
        { x: -0.16, y: 0.02, z: 0.08 },
        { x: -0.16, y: 0.02, z: -0.08 }
    ].forEach(p => {
        const paw = new THREE.Mesh(pawGeo, whiteMat);
        paw.position.set(p.x, p.y, p.z);
        paw.scale.set(1.2, 0.8, 1.0);
        catFigureGroup.add(paw);
    });

    // 5. CHIẾC ĐUÔI VẪY NGOE NGẨY (Curved Tail)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(-0.20, 0.12, 0);

    const tailStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.022, 0.22, 10),
        furMat
    );
    tailStem.position.set(-0.08, 0.08, 0);
    tailStem.rotation.z = 0.85;
    tailGroup.add(tailStem);

    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), whiteMat);
    tailTip.position.set(-0.16, 0.16, 0);
    tailGroup.add(tailTip);

    catFigureGroup.add(tailGroup);
    catTailMesh = tailGroup;

    petCatGroup.add(catFigureGroup);

    // 6. KHỐI TƯƠNG TÁC HITBOX ĐỂ CLICK CHUỘT
    const hitboxGeo = new THREE.BoxGeometry(0.8, 0.65, 0.8);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
    petCatHitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    petCatHitbox.position.set(0, 0.3, 0);
    petCatGroup.add(petCatHitbox);

    targetScene.add(petCatGroup);
    return { petCatGroup, petCatHitbox };
}

/**
 * Hoạt ảnh thở nhè nhẹ, vẫy đuôi và bật nhảy khi được vuốt ve
 */
function animatePetCat(dt, elapsed) {
    if (!petCatGroup) return;

    // 1. Nhịp thở phập phồng nhẹ nhàng
    if (catBodyMesh) {
        catBodyMesh.scale.y = 0.88 + Math.sin(elapsed * 2.8) * 0.035;
    }

    // 2. Chiếc đuôi ngoe nguẩy qua lại
    if (catTailMesh) {
        catTailMesh.rotation.y = Math.sin(elapsed * 4.2) * 0.45;
        catTailMesh.rotation.z = 0.1 + Math.cos(elapsed * 3.2) * 0.15;
    }

    // 3. Nghiêng đầu ngủ mơ màng
    if (catHeadGroup) {
        catHeadGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.04;
        catHeadGroup.rotation.y = Math.sin(elapsed * 1.0) * 0.06;
    }

    // 4. Hiệu ứng bật nhảy vui sướng khi được vuốt ve (Jump when petted)
    if (catJumpTimer > 0) {
        catJumpTimer -= dt;
        const progress = Math.max(0, catJumpTimer / 0.4);
        catFigureGroup.position.y = 0.09 + Math.sin((1 - progress) * Math.PI) * 0.16;
        if (catJumpTimer <= 0) {
            catFigureGroup.position.y = 0.09;
        }
    }
}

/**
 * Tương tác vuốt ve bé mèo (Click chuột hoặc bấm nút)
 */
function interactWithPetCat() {
    playSoundEffect('meow');
    catJumpTimer = 0.4;

    const now = Date.now();
    // Mỗi 15 giây được nhận tiền thưởng may mắn
    if (now - lastCatRewardTime > 15000) {
        lastCatRewardTime = now;
        const reward = 5000;
        gameState.money += reward;
        gameState.revenue += reward;
        updateTopStatsUI();

        setTimeout(() => {
            playSoundEffect('cash');
        }, 150);

        showToast('🐱 Mèo Mimi vui sướng kêu Meow~ và tặng bạn +5.000đ may mắn!');
    } else {
        showToast('🐱 Mèo Mimi gừ gừ êm ái thưởng thức cái vuốt ve của bạn! ❤️');
    }
}
