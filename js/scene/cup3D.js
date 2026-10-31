/* ============================================================================
 * MÔ HÌNH LY TRÀ SỮA 3D TRÊN QUẦY (INTERACTIVE 3D BOBA CUP)
 * Điều khiển visual thân ly, dâng nước trà, hiển thị topping và đóng nắp.
 * ============================================================================ */

const cup3D = {
    group: null,
    liquidMesh: null,
    targetLiquidScale: 0.01,
    bobaGroup: null,
    jellyGroup: null,
    puddingMesh: null,
    cheeseMesh: null,
    lidGroup: null,
    lidTargetY: 1.45
};

function buildCraftingCup3D(targetScene) {
    const group = new THREE.Group();
    // Vị trí đặt ngay trên đế lót màu vàng của quầy bar
    group.position.set(-0.25, 1.48, -0.35);

    // 1. Thân ly nhựa trong suốt bên ngoài
    const cupGeo = new THREE.CylinderGeometry(0.34, 0.24, 0.92, 24, 1, true);
    const cupMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.32,
        shininess: 100,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const cupShell = new THREE.Mesh(cupGeo, cupMat);
    cupShell.position.y = 0.46;
    group.add(cupShell);

    // Đáy ly
    const bottomGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 24);
    const bottomMesh = new THREE.Mesh(bottomGeo, cupMat);
    bottomMesh.position.y = 0.015;
    group.add(bottomMesh);

    // 2. Trụ nước trà bên trong (scale tăng dần khi rót)
    const liqGeo = new THREE.CylinderGeometry(0.31, 0.22, 0.76, 24);
    liqGeo.translate(0, 0.38, 0); // Đặt tâm quay/scale ở đáy
    const liqMat = new THREE.MeshLambertMaterial({
        color: 0xd2a679,
        transparent: true,
        opacity: 0.95
    });
    const liquidMesh = new THREE.Mesh(liqGeo, liqMat);
    liquidMesh.position.y = 0.03;
    liquidMesh.scale.y = 0.001;
    liquidMesh.visible = false;
    group.add(liquidMesh);

    // 3. Topping: Trân châu đen dưới đáy (18 viên tròn)
    const bobaGroup = new THREE.Group();
    const bobaGeo = new THREE.SphereGeometry(0.042, 8, 8);
    const bobaMat = new THREE.MeshPhongMaterial({ color: 0x1c1917, shininess: 80 });
    for (let i = 0; i < 18; i++) {
        const pearl = new THREE.Mesh(bobaGeo, bobaMat);
        const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.4;
        const radius = (i % 3) * 0.065 + 0.03;
        const layerY = i < 10 ? 0.06 : 0.13;
        pearl.position.set(Math.cos(angle) * radius, layerY, Math.sin(angle) * radius);
        bobaGroup.add(pearl);
    }
    bobaGroup.visible = false;
    group.add(bobaGroup);

    // 4. Topping: Thạch trái cây nhiều màu (12 khối lập phương)
    const jellyGroup = new THREE.Group();
    const jellyColors = [0xff6b8b, 0x4ade80, 0xfacc15, 0x38bdf8];
    const jellyGeo = new THREE.BoxGeometry(0.065, 0.065, 0.065);
    for (let i = 0; i < 12; i++) {
        const jMat = new THREE.MeshLambertMaterial({ color: jellyColors[i % jellyColors.length] });
        const cube = new THREE.Mesh(jellyGeo, jMat);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.08 + (i % 2) * 0.07;
        cube.position.set(Math.cos(angle) * radius, 0.24 + (i % 3) * 0.06, Math.sin(angle) * radius);
        cube.rotation.set(i * 0.5, i * 0.8, 0);
        jellyGroup.add(cube);
    }
    jellyGroup.visible = false;
    group.add(jellyGroup);

    // 5. Topping: Lớp pudding trứng
    const puddingMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.23, 0.13, 20),
        new THREE.MeshLambertMaterial({ color: 0xfde047 })
    );
    puddingMesh.position.y = 0.18;
    puddingMesh.visible = false;
    group.add(puddingMesh);

    // 6. Topping: Lớp kem cheese phủ phía trên
    const cheeseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.30, 0.12, 24),
        new THREE.MeshLambertMaterial({ color: 0xfffbeb })
    );
    cheeseMesh.position.y = 0.78;
    cheeseMesh.visible = false;
    group.add(cheeseMesh);

    // 7. Nắp vòm & Ống hút hồng (Lid & Straw)
    const lidGroup = new THREE.Group();
    const rimMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.04, 24),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
    );
    lidGroup.add(rimMesh);

    const strawMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 1.15, 12),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
    );
    strawMesh.position.set(0.05, -0.25, 0);
    strawMesh.rotation.z = -0.12;
    lidGroup.add(strawMesh);

    lidGroup.position.y = 1.45;
    lidGroup.visible = false;
    group.add(lidGroup);

    targetScene.add(group);

    cup3D.group = group;
    cup3D.liquidMesh = liquidMesh;
    cup3D.bobaGroup = bobaGroup;
    cup3D.jellyGroup = jellyGroup;
    cup3D.puddingMesh = puddingMesh;
    cup3D.cheeseMesh = cheeseMesh;
    cup3D.lidGroup = lidGroup;

    return cup3D;
}

/**
 * Cập nhật màu nước trà và hiệu ứng rót dâng lên
 */
function setCup3DTea(teaConfig) {
    if (!cup3D.liquidMesh) return;
    cup3D.liquidMesh.material.color.setHex(teaConfig.color);
    cup3D.liquidMesh.material.opacity = teaConfig.opacity;
    cup3D.liquidMesh.visible = true;
    cup3D.liquidMesh.scale.y = 0.05;
    cup3D.targetLiquidScale = 1.0;
}

/**
 * Đồng bộ topping 3D theo Set topping hiện có
 */
function syncCup3DToppings(toppingsSet) {
    if (!cup3D.bobaGroup) return;
    cup3D.bobaGroup.visible = toppingsSet.has('boba');
    cup3D.jellyGroup.visible = toppingsSet.has('jelly');
    cup3D.puddingMesh.visible = toppingsSet.has('pudding');
    cup3D.cheeseMesh.visible = toppingsSet.has('cheese');
}

/**
 * Đặt lại trạng thái hình ảnh của ly 3D
 */
function resetCup3DVisuals() {
    if (!cup3D.group) return;
    cup3D.liquidMesh.visible = false;
    cup3D.liquidMesh.scale.y = 0.01;
    cup3D.targetLiquidScale = 0.01;
    cup3D.bobaGroup.visible = false;
    cup3D.jellyGroup.visible = false;
    cup3D.puddingMesh.visible = false;
    cup3D.cheeseMesh.visible = false;
    cup3D.lidGroup.visible = false;
    cup3D.lidGroup.position.y = 1.45;
}

/**
 * Cập nhật animation của ly trong vòng lặp game
 */
function updateCup3DAnimations(dt) {
    // 1. Hiệu ứng nước dâng lên
    if (cup3D.liquidMesh && cup3D.liquidMesh.visible) {
        cup3D.liquidMesh.scale.y += (cup3D.targetLiquidScale - cup3D.liquidMesh.scale.y) * 8 * dt;
    }

    // 2. Hiệu ứng nắp dập xuống
    if (cup3D.lidGroup && cup3D.lidGroup.visible) {
        const targetY = 0.92;
        cup3D.lidGroup.position.y += (targetY - cup3D.lidGroup.position.y) * 12 * dt;
    }
}
