/* ============================================================================
 * MÔ HÌNH QUẦY PHA CHẾ & THIẾT BỊ 3D (EQUIPMENT & COUNTER 3D)
 * Quầy pha chế, máy tính tiền, hũ topping & máy dập nắp.
 * ============================================================================ */

function buildCounterAndEquipment(targetScene) {
    const counterGroup = new THREE.Group();
    counterGroup.position.set(-0.6, 0, -0.5);

    // 1. Thân quầy chính
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.3, 1.5), bodyMat);
    bodyMesh.position.y = 0.65;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    counterGroup.add(bodyMesh);

    // 2. Các sọc trang trí mặt trước quầy
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xfffdf9 });
    for (let x = -1.8; x <= 1.8; x += 0.6) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.05), stripeMat);
        stripe.position.set(x, 0.6, 0.76);
        counterGroup.add(stripe);
    }

    // 3. Mặt bàn quầy (Counter Top Slab)
    const topSlab = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.14, 1.7),
        new THREE.MeshLambertMaterial({ color: 0xfffdf9 })
    );
    topSlab.position.y = 1.37;
    topSlab.castShadow = true;
    topSlab.receiveShadow = true;
    counterGroup.add(topSlab);

    // 4. Máy tính tiền (Cash Register - Phía bên phải quầy)
    const cashGroup = new THREE.Group();
    cashGroup.position.set(1.55, 1.44, 0.1);

    const cashBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.35, 0.65),
        new THREE.MeshLambertMaterial({ color: 0xa7f3d0 })
    );
    cashBase.position.y = 0.175;
    cashBase.castShadow = true;
    cashGroup.add(cashBase);

    const cashScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.42, 0.1),
        new THREE.MeshLambertMaterial({ color: 0x374151 })
    );
    cashScreen.position.set(0, 0.5, -0.1);
    cashScreen.rotation.x = -0.25;
    cashGroup.add(cashScreen);
    counterGroup.add(cashGroup);

    // 5. Các hũ đựng trà & topping (Phía bên trái quầy)
    const tubColors = [0xd2a679, 0x88c999, 0x6b4423, 0xff9e5e];
    tubColors.forEach((col, idx) => {
        const tub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.2, 0.45, 16),
            new THREE.MeshLambertMaterial({ color: col })
        );
        tub.position.set(-1.85 + idx * 0.52, 1.66, -0.35);
        tub.castShadow = true;
        counterGroup.add(tub);

        const lid = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16),
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        lid.position.set(-1.85 + idx * 0.52, 1.9, -0.35);
        counterGroup.add(lid);
    });

    // 6. Máy Dập Nắp Ly (Cup Sealing Machine)
    const sealerGroup = new THREE.Group();
    sealerGroup.position.set(-0.65, 1.44, -0.25);

    const sealerBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.95, 0.55),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
    );
    sealerBody.position.y = 0.475;
    sealerBody.castShadow = true;
    sealerGroup.add(sealerBody);

    const sealingPressHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16),
        new THREE.MeshLambertMaterial({ color: 0xfef08a })
    );
    sealingPressHead.position.set(0, 0.75, 0.2);
    sealerGroup.add(sealingPressHead);

    counterGroup.add(sealerGroup);

    // 7. Đế lót ly pha chế (Center Coaster)
    const coaster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.45, 0.04, 24),
        new THREE.MeshLambertMaterial({ color: 0xfde68a })
    );
    coaster.position.set(0.35, 1.46, 0.15);
    counterGroup.add(coaster);

    targetScene.add(counterGroup);

    return {
        counterGroup,
        counterHitboxMesh: bodyMesh,
        sealingPressHead
    };
}
