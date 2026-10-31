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
    }
}
