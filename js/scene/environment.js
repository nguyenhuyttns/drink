/* ============================================================================
 * MÔ HÌNH KHÔNG GIAN TIỆM TRÀ SỮA (SHOP ENVIRONMENT 3D)
 * Bao gồm sàn gạch, tường pastel, cửa ra vào, bàn ghế khách, chậu cây & menu treo tường.
 * ============================================================================ */

let shopFloorTiles = [];

function changeFlooring3D(floorId) {
    if (!shopFloorTiles || shopFloorTiles.length === 0) return;
    const meta = (typeof FLOORING_CATALOG !== 'undefined') ? FLOORING_CATALOG.find(f => f.id === floorId) : null;
    if (!meta) return;

    const matA = new THREE.MeshLambertMaterial({ color: meta.colorA });
    const matB = new THREE.MeshLambertMaterial({ color: meta.colorB });

    shopFloorTiles.forEach(item => {
        item.mesh.material = item.isEven ? matA : matB;
    });
}

function buildPastelShopEnvironment(targetScene) {
    const shopGroup = new THREE.Group();
    shopFloorTiles = [];

    // 1. Đế nền bên dưới sàn
    const baseGeo = new THREE.BoxGeometry(12.4, 0.4, 10.4);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xf9a8d4 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -0.2, 0);
    baseMesh.receiveShadow = true;
    shopGroup.add(baseMesh);

    // 2. Sàn gạch caro Pastel (Checkered Tiles)
    const tileGeo = new THREE.BoxGeometry(1, 0.08, 1);
    const currentFloorId = (typeof gameState !== 'undefined' && gameState.flooring) ? gameState.flooring.current : 'checker_pink';
    const floorMeta = (typeof FLOORING_CATALOG !== 'undefined') ? FLOORING_CATALOG.find(f => f.id === currentFloorId) : null;
    const colorA = floorMeta ? floorMeta.colorA : 0xfffdf9;
    const colorB = floorMeta ? floorMeta.colorB : 0xfce7f3;
    const matCream = new THREE.MeshLambertMaterial({ color: colorA });
    const matPink = new THREE.MeshLambertMaterial({ color: colorB });

    for (let x = -5.5; x <= 5.5; x += 1) {
        for (let z = -4.5; z <= 4.5; z += 1) {
            const isEven = (Math.round(x + 5.5) + Math.round(z + 4.5)) % 2 === 0;
            const tile = new THREE.Mesh(tileGeo, isEven ? matCream : matPink);
            tile.position.set(x, 0.02, z);
            tile.receiveShadow = true;
            shopGroup.add(tile);
            shopFloorTiles.push({ mesh: tile, isEven: isEven });
        }
    }

    // 3. Tường sau & Tường trái
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfff5f7 });
    const wainscotMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(12.2, 4.8, 0.3), wallMat);
    backWall.position.set(0, 2.4, -4.95);
    backWall.receiveShadow = true;
    shopGroup.add(backWall);

    const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(12.1, 1.3, 0.34), wainscotMat);
    backWainscot.position.set(0, 0.65, -4.95);
    shopGroup.add(backWainscot);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.8, 10.2), wallMat);
    leftWall.position.set(-5.95, 2.4, 0);
    leftWall.receiveShadow = true;
    shopGroup.add(leftWall);

    const leftWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.3, 10.1), wainscotMat);
    leftWainscot.position.set(-5.95, 0.65, 0);
    shopGroup.add(leftWainscot);

    // 4. Khung cửa ra vào & Thảm chào mừng (Entrance Door & Mat)
    const doorFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 3.2, 2.0),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
    );
    doorFrame.position.set(-5.92, 1.6, 2.4);
    shopGroup.add(doorFrame);

    const doorGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 2.9, 1.7),
        new THREE.MeshLambertMaterial({ color: 0xe0f2fe })
    );
    doorGlass.position.set(-5.92, 1.55, 2.4);
    shopGroup.add(doorGlass);

    const matMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.04, 1.8),
        new THREE.MeshLambertMaterial({ color: 0xa7f3d0 })
    );
    matMesh.position.set(-5.0, 0.06, 2.4);
    shopGroup.add(matMesh);

    // 5. Bảng Menu Treo Tường (Vẽ bằng Canvas 2D Texture)
    const menuBoardGroup = new THREE.Group();
    menuBoardGroup.position.set(0, 3.3, -4.75);

    const boardFrame = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 1.5, 0.12),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
    );
    menuBoardGroup.add(boardFrame);

    const menuCanvas = document.createElement('canvas');
    menuCanvas.width = 512;
    menuCanvas.height = 160;
    const mCtx = menuCanvas.getContext('2d');
    mCtx.fillStyle = '#fffdf9';
    mCtx.fillRect(0, 0, 512, 160);
    mCtx.fillStyle = '#db2777';
    mCtx.font = 'bold 26px sans-serif';
    mCtx.textAlign = 'center';
    mCtx.fillText('🧋 MENU BOBA SWEET 🧋', 256, 36);

    const items = [
        { name: 'Truyền Thống 25K', color: '#d2a679', x: 75 },
        { name: 'Matcha 30K', color: '#88c999', x: 198 },
        { name: 'Socola 30K', color: '#6b4423', x: 315 },
        { name: 'Trà Đào 25K', color: '#ff9e5e', x: 435 }
    ];
    items.forEach(it => {
        mCtx.fillStyle = it.color;
        mCtx.beginPath();
        mCtx.arc(it.x, 82, 22, 0, Math.PI * 2);
        mCtx.fill();
        mCtx.fillStyle = '#374151';
        mCtx.font = 'bold 14px sans-serif';
        mCtx.fillText(it.name, it.x, 130);
    });

    const menuTex = new THREE.CanvasTexture(menuCanvas);
    const boardFace = new THREE.Mesh(
        new THREE.PlaneGeometry(4.9, 1.3),
        new THREE.MeshBasicMaterial({ map: menuTex })
    );
    boardFace.position.z = 0.07;
    menuBoardGroup.add(boardFace);
    shopGroup.add(menuBoardGroup);

    // 6. Bàn ghế khách ngồi (Bên phải quán)
    createPastelTableSet(shopGroup, 3.6, 1.5);
    createPastelTableSet(shopGroup, 3.6, -1.8);

    // 7. Chậu cây cảnh trang trí
    createCutePlant(shopGroup, -4.8, -3.8);
    createCutePlant(shopGroup, 4.8, -3.8);

    targetScene.add(shopGroup);
    return shopGroup;
}

function createPastelTableSet(parent, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Mặt bàn tròn
    const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 0.1, 24),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    top.position.y = 1.05;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Chân bàn
    const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, 1.05, 12),
        new THREE.MeshLambertMaterial({ color: 0xf9a8d4 })
    );
    leg.position.y = 0.52;
    leg.castShadow = true;
    group.add(leg);

    // Đế bàn
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.45, 0.06, 16),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
    );
    base.position.y = 0.05;
    group.add(base);

    // Hai ghế đẩu pastel kèm theo
    [-1.15, 1.15].forEach((offsetX, i) => {
        const stool = new THREE.Group();
        stool.position.set(offsetX, 0, 0);

        const seat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.36, 0.12, 16),
            new THREE.MeshLambertMaterial({ color: i === 0 ? 0xa7f3d0 : 0xfbcfe8 })
        );
        seat.position.y = 0.65;
        seat.castShadow = true;
        stool.add(seat);

        const sLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.1, 0.65, 10),
            new THREE.MeshLambertMaterial({ color: 0xfde68a })
        );
        sLeg.position.y = 0.32;
        stool.add(sLeg);

        group.add(stool);
    });

    parent.add(group);
}

function createCutePlant(parent, x, z) {
    const plant = new THREE.Group();
    plant.position.set(x, 0, z);

    const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.3, 0.6, 14),
        new THREE.MeshLambertMaterial({ color: 0xfdba74 })
    );
    pot.position.y = 0.3;
    pot.castShadow = true;
    plant.add(pot);

    const bushMat = new THREE.MeshLambertMaterial({ color: 0x6ee7b7 });
    const mainBush = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 12), bushMat);
    mainBush.position.y = 0.85;
    mainBush.castShadow = true;
    plant.add(mainBush);

    const topBush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), bushMat);
    topBush.position.set(0.1, 1.25, 0.1);
    topBush.castShadow = true;
    plant.add(topBush);

    parent.add(plant);
}
