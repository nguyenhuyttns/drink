/* ============================================================================
 * QUẢN LÝ HIỂN THỊ VẬT PHẨM 3D TRONG TIỆM (UPGRADES 3D ENGINE)
 * Tạo dựng và kích hoạt các mô hình 3D khi người chơi mua sắm trong Cửa Hàng.
 * ============================================================================ */

const upgradeMeshes = {
    neonSignGroup: null,
    cozyCarpetMesh: null,
    musicBoxGroup: null
};

/**
 * Áp dụng vật phẩm nâng cấp vào không gian 3D
 * @param {string} upgradeId 
 * @param {THREE.Scene} targetScene 
 */
function applyUpgrade3D(upgradeId, targetScene) {
    if (!targetScene) return;

    switch (upgradeId) {
        // 1. ĐÈN NEON "BOBA SWEET" PHÁT SÁNG TRÊN TƯỜNG SAU
        case 'neon_sign': {
            if (upgradeMeshes.neonSignGroup) {
                upgradeMeshes.neonSignGroup.visible = true;
                return;
            }

            const neonGroup = new THREE.Group();
            neonGroup.position.set(0, 4.35, -4.75);

            // Bảng nền mica đen bóng mờ
            const backBoard = new THREE.Mesh(
                new THREE.BoxGeometry(4.2, 0.75, 0.08),
                new THREE.MeshLambertMaterial({ color: 0x1e1b4b })
            );
            neonGroup.add(backBoard);

            // Viền khung phát sáng
            const frameGeo = new THREE.BoxGeometry(4.3, 0.82, 0.05);
            const frameMat = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.z = -0.02;
            neonGroup.add(frame);

            // Canvas vẽ chữ Neon phát sáng rực rỡ
            const neonCanvas = document.createElement('canvas');
            neonCanvas.width = 1024;
            neonCanvas.height = 256;
            const nCtx = neonCanvas.getContext('2d');

            nCtx.fillStyle = '#1e1b4b';
            nCtx.fillRect(0, 0, 1024, 256);

            // Glow effect
            nCtx.shadowColor = '#f43f5e';
            nCtx.shadowBlur = 24;
            nCtx.font = 'bold 96px sans-serif';
            nCtx.textAlign = 'center';
            nCtx.textBaseline = 'middle';
            nCtx.fillStyle = '#ffffff';
            nCtx.fillText('★ BOBA SWEET ★', 512, 128);

            nCtx.strokeStyle = '#fda4af';
            nCtx.lineWidth = 6;
            nCtx.strokeText('★ BOBA SWEET ★', 512, 128);

            const neonTex = new THREE.CanvasTexture(neonCanvas);
            const textMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(4.0, 0.68),
                new THREE.MeshBasicMaterial({ map: neonTex })
            );
            textMesh.position.z = 0.05;
            neonGroup.add(textMesh);

            // Nguồn sáng PointLight hồng ấm áp tỏa ra tường và quầy
            const neonLight = new THREE.PointLight(0xf43f5e, 1.4, 8);
            neonLight.position.set(0, 0, 0.4);
            neonGroup.add(neonLight);

            targetScene.add(neonGroup);
            upgradeMeshes.neonSignGroup = neonGroup;
            break;
        }

        // 2. THẢM HOA NHUNG PASTEL TRƯỚC QUẦY
        case 'cozy_carpet': {
            if (upgradeMeshes.cozyCarpetMesh) {
                upgradeMeshes.cozyCarpetMesh.visible = true;
                return;
            }

            const carpetGroup = new THREE.Group();
            carpetGroup.position.set(-0.25, 0.025, 1.35);

            // Nhụy hoa trung tâm (Tròn vàng ấm)
            const centerMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.55, 0.55, 0.02, 24),
                new THREE.MeshLambertMaterial({ color: 0xfef08a })
            );
            carpetGroup.add(centerMesh);

            // 6 cánh hoa pastel xung quanh
            const petalMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
            const petalGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.02, 18);
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const petal = new THREE.Mesh(petalGeo, petalMat);
                petal.position.set(Math.cos(angle) * 0.65, 0, Math.sin(angle) * 0.65);
                carpetGroup.add(petal);
            }

            targetScene.add(carpetGroup);
            upgradeMeshes.cozyCarpetMesh = carpetGroup;
            break;
        }

        // 3. MÁY HÁT ĐĨA CỔ ĐIỂN (GRAMOPHONE) TRÊN QUẦY
        case 'music_box': {
            if (upgradeMeshes.musicBoxGroup) {
                upgradeMeshes.musicBoxGroup.visible = true;
                return;
            }

            const gramoGroup = new THREE.Group();
            gramoGroup.position.set(-2.4, 1.44, 0.05);

            // Thùng gỗ máy phát
            const boxMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.46, 0.22, 0.46),
                new THREE.MeshLambertMaterial({ color: 0x78350f })
            );
            boxMesh.position.y = 0.11;
            boxMesh.castShadow = true;
            gramoGroup.add(boxMesh);

            // Đĩa than tròn đen
            const vinyl = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.18, 0.02, 20),
                new THREE.MeshLambertMaterial({ color: 0x18181b })
            );
            vinyl.position.set(0, 0.23, 0);
            gramoGroup.add(vinyl);

            // Kèn loa phát nhạc màu đồng vàng (Loa kèn cổ điển)
            const horn = new THREE.Mesh(
                new THREE.ConeGeometry(0.24, 0.45, 16, 1, true),
                new THREE.MeshLambertMaterial({ color: 0xfbbf24, side: THREE.DoubleSide })
            );
            horn.position.set(0.12, 0.42, 0.1);
            horn.rotation.z = -0.65;
            horn.rotation.y = 0.4;
            gramoGroup.add(horn);

            targetScene.add(gramoGroup);
            upgradeMeshes.musicBoxGroup = gramoGroup;
            break;
        }

        // 4. MÁY DẬP NẮP MẠ VÀNG TỰ ĐỘNG
        case 'auto_sealer': {
            if (typeof sealingPressHeadMesh !== 'undefined' && sealingPressHeadMesh) {
                sealingPressHeadMesh.material.color.setHex(0xf59e0b); // Vàng gold óng ánh
            }
            break;
        }
    }
}

/**
 * Xóa sạch vật phẩm nâng cấp khi người chơi Reset game
 */
function resetAllUpgrades3D(targetScene) {
    if (!targetScene) return;

    if (upgradeMeshes.neonSignGroup) {
        targetScene.remove(upgradeMeshes.neonSignGroup);
        upgradeMeshes.neonSignGroup = null;
    }
    if (upgradeMeshes.cozyCarpetMesh) {
        targetScene.remove(upgradeMeshes.cozyCarpetMesh);
        upgradeMeshes.cozyCarpetMesh = null;
    }
    if (upgradeMeshes.musicBoxGroup) {
        targetScene.remove(upgradeMeshes.musicBoxGroup);
        upgradeMeshes.musicBoxGroup = null;
    }
    if (typeof sealingPressHeadMesh !== 'undefined' && sealingPressHeadMesh) {
        sealingPressHeadMesh.material.color.setHex(0xd1d5db); // Trở về màu xám kim loại ban đầu
    }
}
