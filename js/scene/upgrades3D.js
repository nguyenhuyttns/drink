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

        // 5. QUẦY BÁN BÁNH NGỌT 3D MỚI TOANH (FULL-SIZE SWEET BAKERY COUNTER & STAFF)
        case 'bakery_counter': {
            if (upgradeMeshes.bakeryCounterGroup) {
                upgradeMeshes.bakeryCounterGroup.visible = true;
                if (typeof buildPastryChef3D === 'function') {
                    const chef = buildPastryChef3D(targetScene);
                    if (chef) chef.visible = true;
                }
                return;
            }

            const bakeryGroup = new THREE.Group();
            // Đặt song song hoàn hảo bên trái quầy chính tại X = -4.3, Z = -0.5
            bakeryGroup.position.set(-4.3, 0, -0.5);

            // 1. Thân quầy bánh gỗ pastel bơ mật ong (Matching với quầy pha chế chính)
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
            const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.3, 1.5), bodyMat);
            bodyMesh.position.y = 0.65;
            bodyMesh.castShadow = true;
            bodyMesh.receiveShadow = true;
            bakeryGroup.add(bodyMesh);

            // 2. Các sọc trắng trang trí mặt trước quầy (Đồng bộ thiết kế với quầy chính)
            const stripeMat = new THREE.MeshLambertMaterial({ color: 0xfffdf9 });
            for (let x = -0.9; x <= 0.9; x += 0.6) {
                const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.0, 0.05), stripeMat);
                stripe.position.set(x, 0.6, 0.76);
                bakeryGroup.add(stripe);
            }

            // 3. Mặt bàn quầy đá trắng sang trọng (Countertop Slab)
            const topSlab = new THREE.Mesh(
                new THREE.BoxGeometry(2.85, 0.14, 1.7),
                new THREE.MeshLambertMaterial({ color: 0xfffdf9 })
            );
            topSlab.position.y = 1.37;
            topSlab.castShadow = true;
            topSlab.receiveShadow = true;
            bakeryGroup.add(topSlab);

            // 4. Tủ kính trưng bày bánh 2 tầng cực lớn & sang trọng trên mặt quầy
            const glassFrame = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.82, 1.2),
                new THREE.MeshLambertMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.38
                })
            );
            glassFrame.position.set(0, 1.85, 0);
            bakeryGroup.add(glassFrame);

            // Khung viền kim loại vàng gold bo quanh tủ kính
            const frameGeo = new THREE.BoxGeometry(2.24, 0.86, 1.24);
            const frameMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, wireframe: true });
            const wireMesh = new THREE.Mesh(frameGeo, frameMat);
            wireMesh.position.set(0, 1.85, 0);
            bakeryGroup.add(wireMesh);

            // Đèn LED ấm áp rực rỡ tỏa sáng bên trong tủ bánh
            const innerLight = new THREE.PointLight(0xfef08a, 1.3, 4.0);
            innerLight.position.set(0, 2.05, 0);
            bakeryGroup.add(innerLight);

            // Kệ kính ngăn tầng bên trong tủ
            const shelfMesh = new THREE.Mesh(
                new THREE.BoxGeometry(2.1, 0.02, 1.05),
                new THREE.MeshLambertMaterial({ color: 0xd1fae5, transparent: true, opacity: 0.55 })
            );
            shelfMesh.position.set(0, 1.80, 0);
            bakeryGroup.add(shelfMesh);

            // Khay đựng bánh nướng tầng trên & tầng dưới
            // Tầng 1: Bánh sừng bò nướng bơ Croissant & Donut dâu phủ cốm
            const croissantMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
            [-0.7, -0.45, -0.2].forEach(x => {
                const c = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.045, 8, 16, Math.PI), croissantMat);
                c.position.set(x, 1.90, 0.15);
                c.rotation.x = Math.PI / 2;
                bakeryGroup.add(c);
            });

            const donutMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
            [0.15, 0.45, 0.72].forEach(x => {
                const d = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.04, 10, 18), donutMat);
                d.position.set(x, 1.88, 0.15);
                d.rotation.x = Math.PI / 2;
                bakeryGroup.add(d);
            });

            // Tầng 2: Macaron Pháp 4 màu & Cupcake kem bơ đính cherry
            const macColors = [0x38bdf8, 0xf472b6, 0xfacc15, 0xa855f7];
            [-0.7, -0.48, -0.26, -0.04].forEach((x, idx) => {
                const mac = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 14), new THREE.MeshLambertMaterial({ color: macColors[idx] }));
                mac.position.set(x, 1.48, 0.18);
                bakeryGroup.add(mac);
            });

            [0.25, 0.52, 0.78].forEach(x => {
                const cupk = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.09, 14), new THREE.MeshLambertMaterial({ color: 0xfbbf24 }));
                cupk.position.set(x, 1.50, 0.18);
                const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshLambertMaterial({ color: 0xe11d48 }));
                cherry.position.set(x, 1.57, 0.18);
                bakeryGroup.add(cupk, cherry);
            });

            // 5. Máy POS tính tiền / Tablet cảm ứng trên quầy bánh
            const posBase = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.28, 0.48),
                new THREE.MeshLambertMaterial({ color: 0xa7f3d0 })
            );
            posBase.position.set(0.95, 1.51, 0.1);
            const posScreen = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.32, 0.06),
                new THREE.MeshLambertMaterial({ color: 0x1f2937 })
            );
            posScreen.position.set(0.95, 1.76, -0.02);
            posScreen.rotation.x = -0.28;
            bakeryGroup.add(posBase, posScreen);

            // 6. Bảng biển hiệu 3D "🧁 TIỆM BÁNH NGỌT 🥐" gắn mặt trước quầy
            const signCanvas = document.createElement('canvas');
            signCanvas.width = 512;
            signCanvas.height = 128;
            const sCtx = signCanvas.getContext('2d');
            sCtx.fillStyle = '#f43f5e';
            sCtx.beginPath();
            sCtx.roundRect(10, 10, 492, 108, 28);
            sCtx.fill();
            sCtx.font = 'bold 36px sans-serif';
            sCtx.textAlign = 'center';
            sCtx.textBaseline = 'middle';
            sCtx.fillStyle = '#ffffff';
            sCtx.fillText('🧁 TIỆM BÁNH NGỌT 🥐', 256, 64);

            const signTex = new THREE.CanvasTexture(signCanvas);
            const signPlate = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.42, 0.06),
                new THREE.MeshLambertMaterial({ map: signTex })
            );
            signPlate.position.set(0, 0.65, 0.80);
            bakeryGroup.add(signPlate);

            // 7. Bục đứng gỗ phía sau quầy cho nhân viên
            const stepMesh = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.22, 1.2),
                new THREE.MeshLambertMaterial({ color: 0xfef3c7 })
            );
            stepMesh.position.set(0, 0.11, -1.4);
            bakeryGroup.add(stepMesh);

            targetScene.add(bakeryGroup);
            upgradeMeshes.bakeryCounterGroup = bakeryGroup;

            // 8. TỰ ĐỘNG SINH NHÂN VIÊN BẾP BÁNH ĐỨNG TẠI QUẦY BÁNH
            if (typeof buildPastryChef3D === 'function') {
                const chef = buildPastryChef3D(targetScene);
                if (chef) chef.visible = true;
            }
            if (typeof gameState !== 'undefined') {
                gameState.staff.pastry_chef = true;
            }
            break;
        }

        // 6. CỤM BÀN GHẾ GỖ PASTEL (CẤP 1: 8 CHỖ | CẤP 2: 12 CHỖ)
        case 'extra_tables': {
            const currentLevel = (typeof level === 'number') ? level : ((gameState.upgradeLevels && gameState.upgradeLevels.extra_tables) || 1);
            if (upgradeMeshes.extraTablesGroup) {
                targetScene.remove(upgradeMeshes.extraTablesGroup);
                upgradeMeshes.extraTablesGroup = null;
            }

            const extraGroup = new THREE.Group();
            const tableMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
            const stoolMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
            const stoolMat2 = new THREE.MeshLambertMaterial({ color: 0xa7f3d0 });
            const legMat = new THREE.MeshLambertMaterial({ color: 0x9ca3af });

            // Bàn 3 ở Z = 3.8 và Bàn 4 ở Z = -3.8 (Cấp 1)
            [3.8, -3.8].forEach(z => {
                const top = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 24), tableMat);
                top.position.set(3.6, 0.98, z);
                top.castShadow = true;
                top.receiveShadow = true;
                extraGroup.add(top);

                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.98, 12), legMat);
                leg.position.set(3.6, 0.49, z);
                extraGroup.add(leg);

                [2.45, 4.75].forEach(x => {
                    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16), stoolMat);
                    stool.position.set(x, 0.46, z);
                    stool.castShadow = true;
                    const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 8), legMat);
                    stoolLeg.position.set(x, 0.23, z);
                    extraGroup.add(stool, stoolLeg);
                });
            });

            // Nếu đạt Cấp 2: Thêm tiếp Bàn 5 & Bàn 6 (Tổng 12 chỗ ngồi!)
            if (currentLevel >= 2) {
                [3.8, -3.8].forEach(z => {
                    const top2 = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 24), tableMat);
                    top2.position.set(1.0, 0.98, z);
                    top2.castShadow = true;
                    top2.receiveShadow = true;
                    extraGroup.add(top2);

                    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.98, 12), legMat);
                    leg2.position.set(1.0, 0.49, z);
                    extraGroup.add(leg2);

                    [0.35, 1.65].forEach(x => {
                        const stool2 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16), stoolMat2);
                        stool2.position.set(x, 0.46, z);
                        stool2.castShadow = true;
                        const stoolLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 8), legMat);
                        stoolLeg2.position.set(x, 0.23, z);
                        extraGroup.add(stool2, stoolLeg2);
                    });
                });
            }

            extraGroup.visible = (gameState.decorVisibility && gameState.decorVisibility.extra_tables !== undefined) ? gameState.decorVisibility.extra_tables : true;
            targetScene.add(extraGroup);
            upgradeMeshes.extraTablesGroup = extraGroup;
            break;
        }

        // 7. MỞ RỘNG MẶT BẰNG & ĐẤT QUÁN (CẤP 1: HIÊN GỖ | CẤP 2: VƯỜN SAKURA | CẤP 3: ĐẠI SẢNH)
        case 'expand_shop': {
            const currentLevel = (typeof level === 'number') ? level : ((gameState.upgradeLevels && gameState.upgradeLevels.expand_shop) || 1);
            if (upgradeMeshes.expandShopGroup) {
                targetScene.remove(upgradeMeshes.expandShopGroup);
                upgradeMeshes.expandShopGroup = null;
            }

            const expandGroup = new THREE.Group();

            // CẤP 1: Sàn gỗ mở rộng hiên ngoài + 3 Đèn thả trần + 2 Chậu Monstera
            const extFloorGeo = new THREE.BoxGeometry(6.5, 0.1, 4.5);
            const extFloorMat = new THREE.MeshLambertMaterial({ color: 0xfde68a });
            const extFloor = new THREE.Mesh(extFloorGeo, extFloorMat);
            extFloor.position.set(3.6, -0.05, 4.8);
            extFloor.receiveShadow = true;
            expandGroup.add(extFloor);

            [1.5, 3.6, 5.2].forEach(x => {
                const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.8, 6), new THREE.MeshBasicMaterial({ color: 0x374151 }));
                cord.position.set(x, 4.2, 0);
                const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.32, 16, 1, true), new THREE.MeshLambertMaterial({ color: 0xf472b6, side: THREE.DoubleSide }));
                lampShade.position.set(x, 3.25, 0);
                const light = new THREE.PointLight(0xfef08a, 0.65, 4.5);
                light.position.set(x, 3.1, 0);
                expandGroup.add(cord, lampShade, light);
            });

            [ { x: 6.2, z: 2.2 }, { x: -3.8, z: 2.2 } ].forEach(pos => {
                const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.45, 14), new THREE.MeshLambertMaterial({ color: 0xffffff }));
                pot.position.set(pos.x, 0.225, pos.z);
                const plant = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
                plant.scale.set(1.1, 1.6, 0.9);
                plant.position.set(pos.x, 0.65, pos.z);
                expandGroup.add(pot, plant);
            });

            // CẤP 2: VƯỜN TRÀ ZEN & CÂY HOA ANH ĐÀO SAKURA BUNG NỞ
            if (currentLevel >= 2) {
                // Thảm cỏ vườn xanh ngọc
                const grassGeo = new THREE.BoxGeometry(4.2, 0.08, 4.2);
                const grassMat = new THREE.MeshLambertMaterial({ color: 0x86efac });
                const grassMesh = new THREE.Mesh(grassGeo, grassMat);
                grassMesh.position.set(-3.8, -0.04, 4.8);
                expandGroup.add(grassMesh);

                // Cây hoa Sakura Nhật Bản: Thân gỗ nâu uốn lượn
                const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 2.2, 12), trunkMat);
                trunk.position.set(-3.8, 1.1, 4.8);
                trunk.rotation.z = 0.08;
                expandGroup.add(trunk);

                // Tán hoa anh đào hồng pastel bồng bềnh
                const sakuraMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 });
                const sakuraTopMat = new THREE.MeshLambertMaterial({ color: 0xf472b6 });
                const crown1 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10), sakuraMat);
                crown1.position.set(-3.7, 2.3, 4.8);
                const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 10), sakuraTopMat);
                crown2.position.set(-3.2, 2.6, 4.6);
                const crown3 = new THREE.Mesh(new THREE.SphereGeometry(0.70, 12, 10), sakuraMat);
                crown3.position.set(-4.2, 2.4, 5.0);
                expandGroup.add(crown1, crown2, crown3);

                // Đèn lồng đá Toro phong cách Nhật
                const toroGroup = new THREE.Group();
                toroGroup.position.set(-2.2, 0, 3.6);
                const toroBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.4), new THREE.MeshLambertMaterial({ color: 0x9ca3af }));
                toroBase.position.y = 0.125;
                const toroPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.65, 8), new THREE.MeshLambertMaterial({ color: 0x6b7280 }));
                toroPost.position.y = 0.55;
                const toroLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
                toroLight.position.y = 1.0;
                const lanternRoof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 4), new THREE.MeshLambertMaterial({ color: 0x4b5563 }));
                lanternRoof.position.y = 1.32;
                lanternRoof.rotation.y = Math.PI / 4;
                const toroPointLight = new THREE.PointLight(0xfef08a, 0.8, 4);
                toroPointLight.position.set(0, 1.0, 0);
                toroGroup.add(toroBase, toroPost, toroLight, lanternRoof, toroPointLight);
                expandGroup.add(toroGroup);
            }

            // CẤP 3: ĐẠI SẢNH HOÀNG GIA ĐÔI (GRAND ROYAL HALL)
            if (currentLevel >= 3) {
                // Sàn đá cẩm thạch trắng viền vàng trải dài
                const marbleGeo = new THREE.BoxGeometry(11.8, 0.09, 3.2);
                const marbleMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
                const marbleMesh = new THREE.Mesh(marbleGeo, marbleMat);
                marbleMesh.position.set(0, -0.04, 7.2);
                expandGroup.add(marbleMesh);

                // Thảm đỏ hoàng gia dẫn lối
                const redCarpet = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.11, 4.5), new THREE.MeshLambertMaterial({ color: 0xbe123c }));
                redCarpet.position.set(0, -0.02, 6.8);
                expandGroup.add(redCarpet);

                // 2 Cột cẩm thạch La Mã đầu mạ vàng
                [-4.8, 4.8].forEach(colX => {
                    const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 4.2, 16), new THREE.MeshLambertMaterial({ color: 0xffffff }));
                    colMesh.position.set(colX, 2.1, 7.2);
                    const colCap = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.22, 0.68), new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
                    colCap.position.set(colX, 4.25, 7.2);
                    expandGroup.add(colMesh, colCap);
                });

                // Đèn chùm pha lê rực rỡ treo giữa sảnh
                const chandelier = new THREE.Group();
                chandelier.position.set(0, 3.8, 6.8);
                const chRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 8, 24), new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
                chRing.rotation.x = Math.PI / 2;
                chandelier.add(chRing);
                const chLight = new THREE.PointLight(0xfef08a, 1.8, 8);
                chandelier.add(chLight);
                expandGroup.add(chandelier);
            }

            expandGroup.visible = (gameState.decorVisibility && gameState.decorVisibility.expand_shop !== undefined) ? gameState.decorVisibility.expand_shop : true;
            targetScene.add(expandGroup);
            upgradeMeshes.expandShopGroup = expandGroup;
            break;
        }
    }
}

/**
 * Bật / tắt hiển thị đồ trang trí theo ý muốn của người chơi
 * @param {string} decorId 
 * @param {boolean} isVisible 
 */
function setDecorVisibility3D(decorId, isVisible) {
    if (!gameState || !gameState.decorVisibility) return;
    gameState.decorVisibility[decorId] = isVisible;

    switch (decorId) {
        case 'neon_sign':
            if (upgradeMeshes.neonSignGroup) upgradeMeshes.neonSignGroup.visible = isVisible;
            break;
        case 'cozy_carpet':
            if (upgradeMeshes.cozyCarpetMesh) upgradeMeshes.cozyCarpetMesh.visible = isVisible;
            break;
        case 'music_box':
            if (upgradeMeshes.musicBoxGroup) upgradeMeshes.musicBoxGroup.visible = isVisible;
            break;
        case 'bakery_counter':
            if (upgradeMeshes.bakeryCounterGroup) upgradeMeshes.bakeryCounterGroup.visible = isVisible;
            if (typeof staffMeshes !== 'undefined' && staffMeshes.pastry_chef) {
                staffMeshes.pastry_chef.visible = isVisible;
            }
            break;
        case 'extra_tables':
            if (upgradeMeshes.extraTablesGroup) upgradeMeshes.extraTablesGroup.visible = isVisible;
            break;
        case 'expand_shop':
            if (upgradeMeshes.expandShopGroup) upgradeMeshes.expandShopGroup.visible = isVisible;
            break;
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
    if (upgradeMeshes.bakeryCounterGroup) {
        targetScene.remove(upgradeMeshes.bakeryCounterGroup);
        upgradeMeshes.bakeryCounterGroup = null;
        if (typeof removeStaff3D === 'function') {
            removeStaff3D('pastry_chef', targetScene);
        }
    }
    if (upgradeMeshes.extraTablesGroup) {
        targetScene.remove(upgradeMeshes.extraTablesGroup);
        upgradeMeshes.extraTablesGroup = null;
    }
    if (upgradeMeshes.expandShopGroup) {
        targetScene.remove(upgradeMeshes.expandShopGroup);
        upgradeMeshes.expandShopGroup = null;
    }
    if (typeof sealingPressHeadMesh !== 'undefined' && sealingPressHeadMesh) {
        sealingPressHeadMesh.material.color.setHex(0xd1d5db); // Trở về màu xám kim loại ban đầu
    }
}

/**
 * Áp dụng lại tất cả vật phẩm đã mua vào 3D Scene khi tải game
 */
function applyPurchasedDecorUpgrades(targetScene) {
    if (!targetScene || !gameState || !gameState.upgrades) return;
    Object.keys(gameState.upgrades).forEach(id => {
        if (gameState.upgrades[id]) {
            const lvl = (gameState.upgradeLevels && gameState.upgradeLevels[id]) || 1;
            applyUpgrade3D(id, targetScene, lvl);
        }
    });

    // Đồng bộ trạng thái ẩn/hiện nếu có cấu hình
    if (gameState.decorVisibility) {
        Object.keys(gameState.decorVisibility).forEach(id => {
            setDecorVisibility3D(id, gameState.decorVisibility[id]);
        });
    }
}


