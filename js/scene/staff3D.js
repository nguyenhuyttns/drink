/* ============================================================================
 * MÔ HÌNH NHÂN VIÊN 3D (STAFF 3D ENGINE)
 * Tạo dựng mô hình Chibi 3D cho Bé Thỏ Phục Vụ (Waiter) và Bé Gấu Phụ Quầy.
 * ============================================================================ */

let waiterMeshGroup = null;
let waiterLimbs = null;
let waiterTrayMesh = null;
let assistantBaristaMeshGroup = null;
let assistantBaristaLimbs = null;

/**
 * Dựng mô hình Bé Thỏ Phục Vụ Chibi 3D (Waiter)
 * @param {THREE.Scene} targetScene 
 */
function buildWaiter3D(targetScene) {
    if (waiterMeshGroup) return waiterMeshGroup;

    waiterMeshGroup = new THREE.Group();
    // Vị trí đứng chờ gần cụm bàn khách
    waiterMeshGroup.position.set(1.5, 0, 0.2);
    waiterMeshGroup.rotation.y = Math.PI / 4;

    const fig = createFullyArticulatedChibi({
        name: 'Bé Thỏ Phục Vụ',
        ageGroup: 'teen',
        gender: 'female',
        skinTone: 0xffe0bd,
        hairColor: 0x60a5fa, // Tóc xanh pastel năng động
        hairStyle: 'twintails',
        shirtColor: 0x10b981, // Áo sơ mi xanh mint phục vụ
        pantsColor: 0x064e3b, // Quần tây sẫm màu
        shoesColor: 0x111827
    });

    waiterMeshGroup.add(fig.root);
    waiterLimbs = fig;

    // Chiếc tạp dề phục vụ màu trắng trước ngực
    const apronMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.05), apronMat);
    apron.position.set(0, 0.65, 0.16);
    fig.root.add(apron);

    // Bờm tai thỏ dễ thương trên đầu
    const earMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const innerEarMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
    [-0.14, 0.14].forEach(x => {
        const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.28, 12), earMat);
        ear.position.set(x, 1.48, 0);
        ear.rotation.z = x * -0.2;
        const innerEar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.22, 8), innerEarMat);
        innerEar.position.set(x, 1.48, 0.02);
        innerEar.rotation.z = x * -0.2;
        fig.root.add(ear, innerEar);
    });

    // Chiếc khay inox cầm trên tay phải
    const trayGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16);
    const trayMat = new THREE.MeshLambertMaterial({ color: 0xe5e7eb });
    waiterTrayMesh = new THREE.Mesh(trayGeo, trayMat);
    waiterTrayMesh.position.set(0.06, -0.32, 0.18);
    waiterTrayMesh.rotation.x = Math.PI / 2;
    fig.rightArm.add(waiterTrayMesh);
    fig.rightArm.rotation.x = -0.65;

    targetScene.add(waiterMeshGroup);
    return waiterMeshGroup;
}

/**
 * Dựng mô hình Bé Gấu Phụ Quầy Chibi 3D (Barista Assistant)
 * @param {THREE.Scene} targetScene 
 */
function buildAssistantBarista3D(targetScene) {
    if (assistantBaristaMeshGroup) return assistantBaristaMeshGroup;

    assistantBaristaMeshGroup = new THREE.Group();
    // Vị trí đứng cạnh Barista chính sau quầy
    assistantBaristaMeshGroup.position.set(-1.15, 0, -1.25);
    assistantBaristaMeshGroup.rotation.y = 0;

    const fig = createFullyArticulatedChibi({
        name: 'Bé Gấu Phụ Quầy',
        ageGroup: 'child',
        gender: 'female',
        skinTone: 0xffdfba,
        hairColor: 0x92400e, // Tóc nâu ấm áp
        hairStyle: 'puffs',
        shirtColor: 0xf59e0b, // Đồng phục vàng mật ong
        pantsColor: 0x78350f,
        shoesColor: 0xffffff
    });

    assistantBaristaMeshGroup.add(fig.root);
    assistantBaristaLimbs = fig;

    // Chiếc mũ đầu bếp / tai gấu
    const earMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    [-0.22, 0.22].forEach(x => {
        const bearEar = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), earMat);
        bearEar.position.set(x, 1.42, 0);
        fig.root.add(bearEar);
    });

    targetScene.add(assistantBaristaMeshGroup);
    return assistantBaristaMeshGroup;
}

let pastryChefMeshGroup = null;
let pastryChefLimbs = null;
let greeterDogMeshGroup = null;
let greeterDogLimbs = null;
let greeterDogTail = null;

/**
 * Dựng mô hình Bé Mèo Bếp Bánh Chibi 3D (Pastry Chef)
 * @param {THREE.Scene} targetScene 
 */
function buildPastryChef3D(targetScene) {
    if (pastryChefMeshGroup) return pastryChefMeshGroup;

    pastryChefMeshGroup = new THREE.Group();
    // Vị trí đứng ngay phía sau Quầy Bán Bánh Ngọt
    pastryChefMeshGroup.position.set(-4.3, 0.22, -1.9);
    pastryChefMeshGroup.rotation.y = 0; // Quay mặt về phía trước quầy đón khách

    const fig = createFullyArticulatedChibi({
        name: 'Bé Mèo Bếp Bánh',
        ageGroup: 'child',
        gender: 'female',
        skinTone: 0xffedd5,
        hairColor: 0xfef08a, // Tóc vàng óng bánh mì
        hairStyle: 'puffs',
        shirtColor: 0xffffff, // Áo bếp trưởng trắng muốt
        pantsColor: 0x374151,
        shoesColor: 0x111827
    });

    pastryChefMeshGroup.add(fig.root);
    pastryChefLimbs = fig;

    // Chiếc mũ Bếp Trưởng xốp trắng bồng bềnh
    const hatBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.22, 0.16, 16),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    hatBase.position.set(0, 1.48, 0);

    const hatPuff = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 14, 12),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    hatPuff.position.set(0, 1.62, 0);
    hatPuff.scale.set(1.15, 0.85, 1.15);

    // Đôi tai mèo hồng xinh xắn bên cạnh mũ
    const catEarMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    [-0.24, 0.24].forEach(x => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 8), catEarMat);
        ear.position.set(x, 1.46, 0);
        ear.rotation.z = x * -0.4;
        fig.root.add(ear);
    });

    // Chiếc khăn quàng cổ đỏ thắm của đầu bếp
    const scarf = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.05, 8, 16),
        new THREE.MeshLambertMaterial({ color: 0xe11d48 })
    );
    scarf.position.set(0, 0.92, 0);
    scarf.rotation.x = Math.PI / 2;

    fig.root.add(hatBase, hatPuff, scarf);

    // Khay bánh nướng sáng bóng trên tay
    const tray = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.02, 0.28),
        new THREE.MeshLambertMaterial({ color: 0xfde68a })
    );
    tray.position.set(0, -0.32, 0.22);
    
    // 2 chiếc bánh croissant vàng trên khay
    const miniCroissMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    [-0.1, 0.1].forEach(x => {
        const c = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.02, 6, 10, Math.PI), miniCroissMat);
        c.position.set(x, 0.03, 0);
        c.rotation.x = Math.PI / 2;
        tray.add(c);
    });

    fig.rightArm.add(tray);
    fig.rightArm.rotation.x = -0.75;
    fig.leftArm.rotation.x = -0.75;

    targetScene.add(pastryChefMeshGroup);
    return pastryChefMeshGroup;
}

/**
 * Dựng mô hình Bé Cún Tiếp Tân & Bảo Vệ Chibi 3D (Greeter Dog)
 * @param {THREE.Scene} targetScene 
 */
function buildGreeterDog3D(targetScene) {
    if (greeterDogMeshGroup) return greeterDogMeshGroup;

    greeterDogMeshGroup = new THREE.Group();
    // Vị trí đứng trước cửa quán chào đón khách vào
    greeterDogMeshGroup.position.set(-4.5, 0, 2.75);
    greeterDogMeshGroup.rotation.y = Math.PI / 4;

    const fig = createFullyArticulatedChibi({
        name: 'Bé Cún Tiếp Tân',
        ageGroup: 'child',
        gender: 'male',
        skinTone: 0xfef08a,
        hairColor: 0xd97706, // Lông vàng Shiba ấm áp
        hairStyle: 'messy',
        shirtColor: 0x3b82f6, // Áo vest đồng phục tiếp tân xanh biển
        pantsColor: 0x1e3a8a,
        shoesColor: 0x1f2937
    });

    greeterDogMeshGroup.add(fig.root);
    greeterDogLimbs = fig;

    // Đôi tai cún vểnh đáng yêu
    const dogEarMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const innerEarMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    [-0.22, 0.22].forEach(x => {
        const dEar = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), dogEarMat);
        dEar.position.set(x, 1.48, 0);
        dEar.rotation.z = x * -0.3;

        const inEar = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), innerEarMat);
        inEar.position.set(x, 1.48, 0.03);
        inEar.rotation.z = x * -0.3;
        fig.root.add(dEar, inEar);
    });

    // Huy hiệu sao vàng trước ngực
    const badge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8),
        new THREE.MeshLambertMaterial({ color: 0xfacc15 })
    );
    badge.position.set(0.12, 0.72, 0.16);
    badge.rotation.x = Math.PI / 2;
    fig.root.add(badge);

    // Chiếc đuôi ngoe nguẩy vui mừng phía sau
    const tailGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.28, 8);
    const tailMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    greeterDogTail = new THREE.Mesh(tailGeo, tailMat);
    greeterDogTail.position.set(0, 0.38, -0.22);
    greeterDogTail.rotation.x = -Math.PI / 3;
    fig.root.add(greeterDogTail);

    targetScene.add(greeterDogMeshGroup);
    return greeterDogMeshGroup;
}

/**
 * Xóa mô hình nhân viên khi reset hoặc sa thải
 * @param {string} roleId 
 * @param {THREE.Scene} targetScene 
 */
function removeStaff3D(roleId, targetScene) {
    if (!targetScene) return;

    if (roleId === 'waiter' && waiterMeshGroup) {
        targetScene.remove(waiterMeshGroup);
        waiterMeshGroup = null;
        waiterLimbs = null;
        waiterTrayMesh = null;
    } else if (roleId === 'barista_assistant' && assistantBaristaMeshGroup) {
        targetScene.remove(assistantBaristaMeshGroup);
        assistantBaristaMeshGroup = null;
        assistantBaristaLimbs = null;
    } else if (roleId === 'pastry_chef' && pastryChefMeshGroup) {
        targetScene.remove(pastryChefMeshGroup);
        pastryChefMeshGroup = null;
        pastryChefLimbs = null;
    } else if (roleId === 'greeter_dog' && greeterDogMeshGroup) {
        targetScene.remove(greeterDogMeshGroup);
        greeterDogMeshGroup = null;
        greeterDogLimbs = null;
        greeterDogTail = null;
    }
}
